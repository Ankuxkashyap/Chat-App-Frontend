"use client";

import { useEffect, useState } from "react";
import {
  Edit3,
  Check,
  X,
  Camera,
  MapPin,
  Link2,
  Search,
  MessageCircle,
  UserMinus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api/auth";
import { UserT } from "@/lib/types/user";

type Status = "online" | "away" | "offline";
type FriendFilter = "all" | "online" | "offline";

interface Friend {
  id: number;
  name: string;
  username: string;
  status: Status;
  initials: string;
  mutualFriends: number;
}

interface Profile {
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
}

const ALL_FRIENDS: Friend[] = [
  {
    id: 1,
    name: "Sarah Kim",
    username: "sarahkim",
    status: "online",
    initials: "SK",
    mutualFriends: 12,
  },
  {
    id: 2,
    name: "James Park",
    username: "jamespark",
    status: "online",
    initials: "JP",
    mutualFriends: 8,
  },
  {
    id: 3,
    name: "Mia Torres",
    username: "miatorres",
    status: "offline",
    initials: "MT",
    mutualFriends: 5,
  },
  {
    id: 4,
    name: "Lucas Ng",
    username: "lucasng",
    status: "offline",
    initials: "LN",
    mutualFriends: 3,
  },
  {
    id: 5,
    name: "Priya Raj",
    username: "priyaraj",
    status: "online",
    initials: "PR",
    mutualFriends: 7,
  },
  {
    id: 6,
    name: "Ethan Wu",
    username: "ethanwu",
    status: "offline",
    initials: "EW",
    mutualFriends: 2,
  },
  {
    id: 7,
    name: "Nina Cheng",
    username: "ninacheng",
    status: "online",
    initials: "NC",
    mutualFriends: 9,
  },
  {
    id: 8,
    name: "Omar Hassan",
    username: "omarhassan",
    status: "offline",
    initials: "OH",
    mutualFriends: 4,
  },
  {
    id: 9,
    name: "Lily Zhang",
    username: "lilyzhang",
    status: "online",
    initials: "LZ",
    mutualFriends: 6,
  },
  {
    id: 10,
    name: "Carlos Rivas",
    username: "carlosrivas",
    status: "offline",
    initials: "CR",
    mutualFriends: 1,
  },
  {
    id: 11,
    name: "Aisha Malik",
    username: "aishamalik",
    status: "online",
    initials: "AM",
    mutualFriends: 10,
  },
  {
    id: 12,
    name: "Ben Foster",
    username: "benfoster",
    status: "offline",
    initials: "BF",
    mutualFriends: 3,
  },
];

const STATUS_LABEL: Record<Status, string> = {
  online: "Online",
  away: "Away",
  offline: "Offline",
};

const PAGE_SIZE = 6;

const DEFAULT_PROFILE: Profile = {
  name: "",
  username: "",
  bio: "",
  location: "",
  website: "",
};

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StatusDot({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
        status === "online" && "bg-green-500",
        status === "offline" && "bg-transparent border-muted-foreground/30",
      )}
    />
  );
}

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FriendFilter>("all");
  const [page, setPage] = useState(1);
  const [removed, setRemoved] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<UserT | null>(null);
  const [draft, setDraft] = useState<Profile>(DEFAULT_PROFILE);

  const save = async () => {
    try {
      // await authApi.updateUser(draft);
      setUser((prev) => (prev ? { ...prev, ...draft } : prev));
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const cancel = () => {
    if (user) {
      setDraft({
        name: user.name ?? "",
        username: user.username ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
        website: user.website ?? "",
      });
    }
    setEditing(false);
  };

  const editFields: {
    label: string;
    key: keyof Profile;
    placeholder: string;
  }[] = [
    { label: "Display Name", key: "name", placeholder: "Your name" },
    { label: "Username", key: "username", placeholder: "username" },
    { label: "Location", key: "location", placeholder: "City, Country" },
    { label: "Website", key: "website", placeholder: "yoursite.com" },
  ];

  const activeFriends = ALL_FRIENDS.filter((f) => !removed.includes(f.id));

  const filtered = activeFriends.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.username.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "online"
          ? f.status !== "offline"
          : f.status === "offline";
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const onlineCount = activeFriends.filter(
    (f) => f.status !== "offline",
  ).length;
  const offlineCount = activeFriends.filter(
    (f) => f.status === "offline",
  ).length;

  const handleRemove = (id: number) => {
    setRemoved((prev) => [...prev, id]);
    if (paginated.length === 1 && safePage > 1) setPage(safePage - 1);
  };

  const filterTabs: { id: FriendFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: activeFriends.length },
    { id: "online", label: "Online", count: onlineCount },
    { id: "offline", label: "Offline", count: offlineCount },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getUser();
        setUser(res.user);
        setDraft({
          name: res.name ?? "",
          username: res.username ?? "",
          bio: res.bio ?? "",
          location: res.location ?? "",
          website: res.website ?? "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/40 text-foreground">
        <div className="relative h-[160px] sm:h-[200px] overflow-hidden bg-muted">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,transparent,transparent 24px,hsl(var(--muted-foreground)/0.07) 24px,hsl(var(--muted-foreground)/0.07) 25px)",
            }}
          />
          {editing && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-3 right-4 gap-1.5 backdrop-blur-sm bg-background/70"
            >
              <Camera size={13} /> Change Cover
            </Button>
          )}
        </div>

        <div className="max-w-[900px] mx-auto px-4 sm:px-6 pb-24">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-7">
            <div className="relative -mt-10 sm:-mt-12">
              <Avatar className="w-[80px] h-[80px] sm:w-[92px] sm:h-[92px] rounded-[20px] sm:rounded-[22px] border-4 border-background shadow-lg">
                <AvatarFallback className="rounded-[16px] sm:rounded-[18px] text-xl font-black bg-muted text-foreground">
                  {getInitials(user.name ?? "")}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-1.5 right-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-green-500 border-[3px] border-background" />
              {editing && (
                <button className="absolute inset-0 rounded-[20px] sm:rounded-[22px] bg-black/50 flex items-center justify-center text-white cursor-pointer border-none">
                  <Camera size={18} />
                </button>
              )}
            </div>

            <div className="flex gap-2 pb-1">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancel}
                    className="gap-1.5"
                  >
                    <X size={13} /> Cancel
                  </Button>
                  <Button size="sm" onClick={save} className="gap-1.5">
                    <Check size={13} /> Save changes
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="gap-1.5"
                >
                  <Edit3 size={13} /> Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 items-start">
            <div className="rounded-[18px] border border-border bg-card p-5 sm:p-[22px]">
              {editing ? (
                <div className="flex flex-col gap-4">
                  {editFields.map(({ label, key, placeholder }) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground">
                        {label}
                      </Label>
                      <Input
                        value={draft[key]}
                        onChange={(e) =>
                          setDraft({ ...draft, [key]: e.target.value })
                        }
                        placeholder={placeholder}
                        className="h-9 text-sm"
                      />
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground">
                      Bio
                    </Label>
                    <Textarea
                      value={draft.bio}
                      onChange={(e) =>
                        setDraft({ ...draft, bio: e.target.value })
                      }
                      placeholder="Tell people about yourself…"
                      rows={3}
                      className="text-sm resize-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h1 className="text-xl font-black tracking-[-0.04em] leading-none mb-1">
                      {user.name}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                      @{user.username}
                    </p>
                  </div>

                  {user.bio && (
                    <p className="text-sm leading-relaxed text-foreground/75 mb-5">
                      {user.bio}
                    </p>
                  )}

                  <div className="flex flex-col gap-2.5">
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin
                          size={13}
                          className="text-muted-foreground shrink-0"
                        />
                        <span className="text-sm text-muted-foreground">
                          {user.location}
                        </span>
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center gap-2">
                        <Link2
                          size={13}
                          className="text-foreground/60 shrink-0"
                        />
                        <span className="text-sm font-semibold">
                          {user.website}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <Badge
                      variant="secondary"
                      className="gap-1.5 rounded-full px-3 py-1 font-semibold text-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Active now
                    </Badge>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-[18px] border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h2 className="text-sm font-bold">
                    Friends
                    <span className="font-normal text-muted-foreground ml-1.5">
                      {activeFriends.length}
                    </span>
                  </h2>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-[200px]">
                      <Search
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search…"
                        className="h-8 pl-8 text-xs"
                      />
                    </div>

                    <div className="flex rounded-[9px] border border-border bg-muted/40 p-0.5 gap-0.5 shrink-0">
                      {filterTabs.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setFilter(t.id);
                            setPage(1);
                          }}
                          className={cn(
                            "px-2.5 py-1 rounded-[7px] text-[11px] font-semibold transition-all duration-150 cursor-pointer border-none whitespace-nowrap",
                            filter === t.id
                              ? "bg-background text-foreground shadow-sm"
                              : "bg-transparent text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {t.label}
                          <span
                            className={cn(
                              "ml-1 text-[10px]",
                              filter === t.id ? "opacity-50" : "opacity-40",
                            )}
                          >
                            {t.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[12px] border border-border overflow-hidden">
                  {paginated.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No friends found
                      </p>
                      {search && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs"
                          onClick={() => {
                            setSearch("");
                            setPage(1);
                          }}
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div>
                      {paginated.map((f, i) => (
                        <div key={f.id}>
                          <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors duration-150">
                            <div className="relative shrink-0">
                              <Avatar className="w-9 h-9 sm:w-10 sm:h-10 rounded-[11px] sm:rounded-[12px]">
                                <AvatarFallback className="rounded-[9px] sm:rounded-[10px] text-xs font-black bg-muted text-foreground">
                                  {f.initials}
                                </AvatarFallback>
                              </Avatar>
                              <StatusDot status={f.status} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold tracking-[-0.01em] leading-none mb-1 truncate">
                                {f.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                @{f.username}
                                {f.mutualFriends > 0 && (
                                  <span className="ml-1.5 opacity-50">
                                    · {f.mutualFriends} mutual
                                  </span>
                                )}
                              </p>
                            </div>

                            <Badge
                              variant="secondary"
                              className={cn(
                                "hidden sm:flex text-[10px] px-2 py-0 h-5 rounded-full font-semibold shrink-0",
                                f.status === "online" &&
                                  "bg-green-500/10 text-green-600 dark:text-green-400",
                                f.status === "away" &&
                                  "bg-amber-400/10 text-amber-600 dark:text-amber-400",
                              )}
                            >
                              {STATUS_LABEL[f.status]}
                            </Badge>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs hidden sm:flex"
                                  >
                                    <MessageCircle size={13} /> Message
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs sm:hidden">
                                  Message
                                </TooltipContent>
                              </Tooltip>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 sm:hidden"
                              >
                                <MessageCircle size={13} />
                              </Button>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:border-destructive hover:text-destructive transition-colors"
                                    onClick={() => handleRemove(f.id)}
                                  >
                                    <UserMinus size={13} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                  Remove friend
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          {i < paginated.length - 1 && <Separator />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {(safePage - 1) * PAGE_SIZE + 1}–
                      {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
                      {filtered.length}
                    </p>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={safePage === 1}
                        onClick={() => setPage(safePage - 1)}
                      >
                        <ChevronLeft size={13} />
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <Button
                            key={p}
                            variant={p === safePage ? "default" : "outline"}
                            size="sm"
                            className="h-7 w-7 p-0 text-xs"
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </Button>
                        ),
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={safePage === totalPages}
                        onClick={() => setPage(safePage + 1)}
                      >
                        <ChevronRight size={13} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
