"use client";

import { useState, useRef } from "react";
import { Input, Button, TextArea } from "@/components/ui";
import { Upload, Video, Image as ImageIcon, CheckCircle } from "lucide-react";
import { videosApi } from "@/lib/api/videos";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { getErrorMessage } from "@/lib/api/client";

export default function UploadPage() {
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!videoFile || !thumbnailFile || !title.trim() || !description.trim()) {
      setError("Please fill in all fields and select both video and thumbnail files.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("desc", description.trim());
    formData.append("description", description.trim());
    formData.append("video", videoFile);
    formData.append("thumbnail", thumbnailFile);
    formData.append("duration", "0");

    setIsLoading(true);
    try {
      await videosApi.publishVideo(formData);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Upload failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-4">
            <Upload size={30} className="text-[var(--color-accent)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
            Sign in to upload
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            You need to be logged in to upload videos.
          </p>
          <Link href="/login">
            <Button color="primary" size="md">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
            Video uploaded!
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Your video has been published successfully.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              color="secondary"
              onPress={() => {
                setSuccess(false);
                setTitle("");
                setDescription("");
                setVideoFile(null);
                setThumbnailFile(null);
                setThumbnailPreview(null);
              }}
            >
              Upload Another
            </Button>
            <Link href="/">
              <Button color="primary">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Upload size={22} className="text-[var(--color-accent)]" />
          <h1
            className="text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Upload Video
          </h1>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Publish your video to your channel and share your content with the world
        </p>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                  Video Details
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Add a title and description to help viewers discover your video.
                </p>
              </div>

              <Input
                id="upload-title"
                label="Title"
                placeholder="Enter a descriptive title"
                value={title}
                onValueChange={setTitle}
                classNames={inputClassNames}
                isRequired
              />

              <TextArea
                id="upload-description"
                label="Description"
                placeholder="Describe your video, add timestamps, tags, or links..."
                value={description}
                onValueChange={setDescription}
                minRows={6}
                classNames={{
                  label: "text-[var(--color-text-secondary)] text-xs font-semibold",
                  inputWrapper:
                    "bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] group-data-[focus=true]:border-[var(--color-accent)] shadow-none rounded-2xl p-4",
                  input:
                    "text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]",
                }}
                isRequired
              />

              <div className="p-4 rounded-2xl bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] space-y-1.5">
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">Publishing Guidelines</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Make sure your content complies with our Community Guidelines and does not infringe copyright. Your video will be visible globally once published.
                </p>
              </div>
            </div>

            {/* Right Column: Files & Submit */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                  Media Files
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Select your video master file and custom artwork.
                </p>
              </div>

              {/* Video file */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                  Video File *
                </label>
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface-2)]/60 rounded-2xl p-6 text-center transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                    <Video
                      size={24}
                      className="text-[var(--color-accent)]"
                    />
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {videoFile ? videoFile.name : "Click to select video file"}
                  </p>
                  {videoFile ? (
                    <p className="text-xs text-[var(--color-accent)] mt-1 font-semibold">
                      {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                      MP4, WebM, or MOV up to 500MB
                    </p>
                  )}
                </div>
                <input
                  ref={videoInputRef}
                  id="upload-video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                  Thumbnail *
                </label>
                <div
                  onClick={() => thumbInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface-2)]/60 rounded-2xl overflow-hidden transition-all duration-200 group"
                >
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <ImageIcon
                          size={24}
                          className="text-[var(--color-accent)]"
                        />
                      </div>
                      <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Click to select thumbnail
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        16:9 ratio recommended (JPG, PNG)
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={thumbInputRef}
                  id="upload-thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnail}
                  className="hidden"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  color="primary"
                  size="lg"
                  className="w-full font-semibold shadow-md"
                  startContent={!isLoading && <Upload size={16} />}
                >
                  {isLoading ? "Uploading..." : "Publish Video"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClassNames = {
  label: "text-[var(--color-text-secondary)] text-xs font-medium",
  inputWrapper:
    "bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] group-data-[focus=true]:border-[var(--color-accent)] shadow-none rounded-full px-4",
  input:
    "text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]",
};
