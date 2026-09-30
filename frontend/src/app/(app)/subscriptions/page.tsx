"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { usersApi } from "@/lib/api/users";
import { Spinner, Button } from "@/components/ui";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Users, Sparkles } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Link from "next/link";
import { haptics } from "@/lib/haptics";
import type { Subscription, User } from "@/lib/types";

const FEATURED_CREATORS = [
  {
    name: "Sarah Chen",
    username: "sarahcodes",
    subscribers: "128K subscribers",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "React & Next.js",
  },
  {
    name: "Alex Rivera",
    username: "alexdev",
    subscribers: "84K subscribers",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    role: "Clean Code & Systems",
  },
  {
    name: "Elena Rostova",
    username: "elenacodes",
    subscribers: "210K subscribers",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Design Systems & UI",
  },
  {
    name: "Marcus Vance",
    username: "marcusvance",
    subscribers: "95K subscribers",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    role: "Cloud & Microservices",
  },
];

export default function SubscriptionsPage() {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["subscriptions-list"],
    queryFn: () => subscriptionsApi.getSubscriptionsList(),
    enabled: isAuthenticated,
  });

  const { data: recommendedData } = useQuery({
    queryKey: ["recommended-users"],
    queryFn: () => usersApi.getRecommendedUsers(4),
    enabled: isAuthenticated,
  });

  const queryClient = useQueryClient();
  const subscribeMutation = useMutation({
    mutationFn: (channelId: string) => subscriptionsApi.toggleSubscription(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions-list"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-users"] });
    },
  });

  const channels: Subscription[] = data?.data ?? [];
  const recommendedUsers = recommendedData?.data ?? [];

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-10">
        <div className="flex items-center gap-2">
          <Users size={22} className="text-[var(--color-accent)]" />
          <h1
            className="text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Subscriptions
          </h1>
        </div>
        <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-sm">
          <EmptyState
            title="Sign in to see subscriptions"
            description="Log in to view channels you've subscribed to and follow creator updates."
            icon={<Users size={32} className="text-[var(--color-accent)]" />}
            action={
              <Link href="/login">
                <Button color="primary" size="md">
                  Sign In
                </Button>
              </Link>
            }
          />
        </div>

        {/* Featured Creators to Discover */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--color-accent)]" />
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              Discover Popular Creators
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {FEATURED_CREATORS.map((creator) => (
              <div
                key={creator.username}
                className="p-5 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 text-center flex flex-col items-center justify-between"
              >
                <div className="flex flex-col items-center">
                  <UserAvatar user={{ fullName: creator.name, username: creator.username, avatar: creator.avatar }} fallbackName={creator.username} className="w-16 h-16 mb-3 rounded-full ring-2 ring-[var(--color-border)]" animate="always" />
                  <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{creator.name}</h3>
                  <p className="text-xs text-[var(--color-accent)] font-medium">@{creator.username}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{creator.subscribers}</p>
                  <span className="text-[11px] px-2.5 py-0.5 mt-2 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    {creator.role}
                  </span>
                </div>
                <div className="w-full flex items-center gap-2 mt-4">
                  <Link href={`/login`} className="flex-1">
                    <Button size="sm" color="primary" radius="full" className="w-full text-xs font-bold shadow-md">
                      Subscribe
                    </Button>
                  </Link>
                  <Link href={`/channel/${creator.username}`} className="flex-1">
                    <Button size="sm" variant="flat" radius="full" className="w-full text-xs font-semibold bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                      Channel
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users size={22} className="text-[var(--color-accent)]" />
          <h1
            className="text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Subscriptions
          </h1>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Channels and creators you follow
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="space-y-12">
          {/* Subscriptions Grid or Empty State */}
          {channels.length === 0 ? (
            <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-sm">
              <EmptyState
                title="No subscriptions yet"
                description="Creators you subscribe to will appear here. Discover top channels below to start following."
                icon={<Users size={32} className="text-[var(--color-accent)]" />}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {channels.map((sub) => {
                const channel =
                  typeof sub.channel === "object" ? (sub.channel as User) : null;
                if (!channel) return null;

                // Determine what to show as a preview (actual last video > actual last tweet > clean profile card)
                const hasRealVideo = !!sub.lastVideo && !!sub.lastVideo.thumbnail;
                const hasRealTweet = !hasRealVideo && !!sub.lastTweet;
                
                return (
                  <Link
                    key={sub._id}
                    href={`/channel/${channel.username}`}
                    onClick={() => haptics.selection()}
                    className="flex flex-col p-4 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)] transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3.5 mb-4">
                      <UserAvatar
                        user={channel}
                        className="w-12 h-12 rounded-full"
                        animate="always"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                          {channel.fullName}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                          @{channel.username}
                        </p>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-auto relative rounded-2xl overflow-hidden aspect-video border border-[var(--color-border)]/50 bg-[var(--color-surface-2)] flex flex-col justify-center">
                      {hasRealVideo ? (
                        <>
                          <img 
                            src={sub.lastVideo!.thumbnail} 
                            alt="Recent upload preview" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-2 left-3 right-3">
                            <p className="text-[10px] font-medium text-emerald-400 mb-0.5 uppercase tracking-wider">Latest Release</p>
                            <p className="text-xs font-semibold text-white truncate">{sub.lastVideo!.title}</p>
                          </div>
                        </>
                      ) : hasRealTweet ? (
                        <div className="p-4 flex flex-col justify-center h-full">
                           <p className="text-[10px] font-medium text-[var(--color-accent)] mb-1 uppercase tracking-wider">Latest Update</p>
                           <p className="text-xs text-[var(--color-text-primary)] line-clamp-4 italic">&ldquo;{sub.lastTweet!.content}&rdquo;</p>
                        </div>
                      ) : (
                        <div className="p-4 flex flex-col justify-center items-center text-center h-full bg-[var(--color-surface)]/50">
                          <p className="text-[11px] font-semibold text-[var(--color-accent)] mb-0.5">Community Member</p>
                          <p className="text-[11px] text-[var(--color-text-tertiary)]">Visit profile to view updates & discussions</p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="w-full h-px bg-[var(--color-border)]/50" />

          {/* Featured Creators */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--color-accent)]" />
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Recommended Creators
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendedUsers.length > 0 ? recommendedUsers.map((creator: any) => (
                <div
                  key={creator.username}
                  className="p-5 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 text-center flex flex-col items-center justify-between"
                >
                  <div className="flex flex-col items-center">
                    <UserAvatar user={creator} className="w-16 h-16 mb-3 rounded-full ring-2 ring-[var(--color-border)]" animate="always" />
                    <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{creator.fullName || creator.username}</h3>
                    <p className="text-xs text-[var(--color-accent)] font-medium">@{creator.username}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{creator.subscribersCount || 0} subscribers</p>
                  </div>
                  <div className="w-full flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      color="primary"
                      radius="full"
                      className="flex-1 text-xs font-bold shadow-md"
                      isLoading={subscribeMutation.isPending && subscribeMutation.variables === creator._id}
                      onPress={() => subscribeMutation.mutate(creator._id)}
                    >
                      Subscribe
                    </Button>
                    <Link href={`/channel/${creator.username}`} className="flex-1">
                      <Button size="sm" variant="flat" radius="full" className="w-full text-xs font-semibold bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                        Channel
                      </Button>
                    </Link>
                  </div>
                </div>
              )) : FEATURED_CREATORS.map((creator) => (
                <div
                  key={creator.username}
                  className="p-5 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 text-center flex flex-col items-center justify-between"
                >
                  <div className="flex flex-col items-center">
                    <UserAvatar user={{ fullName: creator.name, username: creator.username, avatar: creator.avatar }} fallbackName={creator.username} className="w-16 h-16 mb-3 rounded-full ring-2 ring-[var(--color-border)]" animate="always" />
                    <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{creator.name}</h3>
                    <p className="text-xs text-[var(--color-accent)] font-medium">@{creator.username}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{creator.subscribers}</p>
                    <span className="text-[11px] px-2.5 py-0.5 mt-2 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {creator.role}
                    </span>
                  </div>
                  <div className="w-full flex items-center gap-2 mt-4">
                    <Link href={`/login`} className="flex-1">
                      <Button size="sm" color="primary" radius="full" className="w-full text-xs font-bold shadow-md">
                        Subscribe
                      </Button>
                    </Link>
                    <Link href={`/channel/${creator.username}`} className="flex-1">
                      <Button size="sm" variant="flat" radius="full" className="w-full text-xs font-semibold bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                        Channel
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
