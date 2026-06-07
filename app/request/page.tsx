"use client";

import { useEffect, useState } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";
import { requestApi } from "@/lib/api/request";
import { RequestT, UserT } from "@/lib/types/user";
import Image from "next/image";
import toast from "react-hot-toast";
import { userApi } from "@/lib/api/user";
import { friendApi } from "@/lib/api/friend";

export default function FollowRequests() {
  const [requests, setRequests] = useState<RequestT[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserT[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await friendApi.get(1, 100);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setFriendIds(new Set(list.map((u: UserT) => u.id)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await userApi.search(search);
        if (!cancelled) setSearchResults(res);
      } catch (error) {
        if (!cancelled) console.error("Search failed:", error);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    const getRequests = async (): Promise<void> => {
      try {
        setLoading(true);
        const res = await requestApi.get();
        setRequests(res);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    getRequests();
  }, []);

  const handleAccept = async (id: string): Promise<void> => {
    try {
      const res = await requestApi.accept(id);
      if (res === "success") {
        toast.success("Request accepted");
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const res = await requestApi.reject(id);
      if (res === "success") {
        toast.success("Request rejected");
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (id: string): Promise<void> => {
    try {
      await requestApi.send(id);
      toast.success("Friend request sent");
      setFriendIds((prev) => new Set(prev).add(id));
    } catch (err) {
      toast.error("Failed to send request");
    }
  };

  const Avatar = ({ name, avatar }: { name: string; avatar?: string }) =>
    avatar ? (
      <Image
        src={avatar}
        alt={name}
        width={44}
        height={44}
        className="w-11 h-11 rounded-full object-cover ring-2 ring-black/5 dark:ring-white/5"
      />
    ) : (
      <div className="w-11 h-11 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-semibold ring-2 ring-black/10 dark:ring-white/10">
        {name
          ?.split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)}
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 py-10 max-w-md mx-auto">
      <div className="relative mb-8">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30"
          size={15}
        />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-sm transition-all"
        />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          {search.trim() ? "Search Results" : "Follow Requests"}
        </h1>
        <p className="text-black/40 dark:text-white/40 text-sm mt-1">
          {search.trim()
            ? isSearching
              ? "Searching..."
              : `${searchResults.length} ${searchResults.length === 1 ? "user" : "users"} found`
            : `${requests.length} pending ${requests.length === 1 ? "request" : "requests"}`}
        </p>
      </div>

      <div className="space-y-2">
        {search.trim() ? (
          isSearching ? (
            <div className="text-center py-16">
              <p className="text-black/30 dark:text-white/30 text-sm">
                Searching...
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-black/30 dark:text-white/30 text-sm">
                No users found
              </p>
            </div>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-black/8 dark:border-white/8 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} avatar={user.avatar} />
                  <div>
                    <p className="font-semibold text-black dark:text-white tracking-tight">
                      {user.name}
                    </p>
                    <p className="text-black/40 dark:text-white/40 text-xs">
                      @{user.username}
                    </p>
                  </div>
                </div>
                {!friendIds.has(user.id) && (
                  <button
                    onClick={() => handleAddFriend(user.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all duration-200"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-black/30 dark:text-white/30 text-sm">
              No pending requests
            </p>
          </div>
        ) : (
          requests.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-black/8 dark:border-white/8 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <Avatar name={r.sender.name} avatar={r.sender.avatar} />
                <div>
                  <p className="font-semibold text-black dark:text-white tracking-tight">
                    {r.sender.name}
                  </p>
                  <p className="text-black/40 dark:text-white/40 text-xs">
                    @{r.sender.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReject(r.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all duration-200"
                >
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
                <button
                  onClick={() => handleAccept(r.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all duration-200"
                >
                  <Check className="w-3.5 h-3.5 text-green-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
