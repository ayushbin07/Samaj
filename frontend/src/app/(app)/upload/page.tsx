"use client";

import { useState, useRef } from "react";
import { Input, Button, TextArea } from "@/components/ui";
import { Upload, Image as ImageIcon, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { getErrorMessage, apiClient } from "@/lib/api/client";

export default function UploadPage() {
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("Please fill in both title and description.");
      return;
    }

    const formData = new FormData();
    // Build the content string from title + description
    const content = `**${title.trim()}**\n\n${description.trim()}`;
    formData.append("content", content);
    if (imageFile) {
      formData.append("media", imageFile);
    }

    setIsLoading(true);
    try {
      await apiClient.post("/tweets/create-tweet", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Post failed. Please try again."));
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
            Sign in to post
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            You need to be logged in to share posts.
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
            Post published!
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Your post has been shared with the community successfully.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              color="secondary"
              onPress={() => {
                setSuccess(false);
                setTitle("");
                setDescription("");
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              Post Another
            </Button>
            <Link href="/community">
              <Button color="primary">
                View Community
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
            Create Post
          </h1>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Share your thoughts and images with the Samaj community
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
                  Post Details
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Give your post a title and description to help the community understand it.
                </p>
              </div>

              <Input
                id="upload-title"
                label="Title"
                placeholder="Enter a title for your post"
                value={title}
                onValueChange={setTitle}
                classNames={inputClassNames}
                isRequired
              />

              <TextArea
                id="upload-description"
                label="Description"
                placeholder="What's on your mind? Add context, links, or details..."
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
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">Community Guidelines</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Keep posts respectful and relevant. Do not share copyrighted material or spam. Posts are visible to all community members.
                </p>
              </div>
            </div>

            {/* Right Column: Image & Submit */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                  Attach Image
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Optional — attach one image to your post (JPG, PNG, GIF, WebP up to 8 MB).
                </p>
              </div>

              {/* Image file */}
              <div>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface-2)]/60 rounded-2xl overflow-hidden transition-all duration-200 group"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Selected image preview"
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
                        {imageFile ? imageFile.name : "Click to select an image"}
                      </p>
                      {imageFile ? (
                        <p className="text-xs text-[var(--color-accent)] mt-1 font-semibold">
                          {(imageFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      ) : (
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                          JPG, PNG, GIF, WebP · max 8 MB
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  id="upload-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="mt-2 text-xs text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors"
                  >
                    Remove image
                  </button>
                )}
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
                  {isLoading ? "Publishing..." : "Publish Post"}
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
