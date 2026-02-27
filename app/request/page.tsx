"use client";

import { use, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { requestApi } from "@/lib/api/request";
import { RequestT, UserT } from "@/lib/types/user";
import Image from "next/image";
import toast from "react-hot-toast";

const mockRequests = [
  {
    id: 1,
    name: "Alex Morgan",
    username: "alexmorgan",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Jordan Lee",
    username: "jordanlee",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    name: "Sam Taylor",
    username: "samtaylor",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 4,
    name: "Casey Kim",
    username: "caseykim",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: 5,
    name: "Riley Chen",
    username: "rileychen",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

export default function FollowRequests() {
  const [requests, setRequests] = useState<RequestT[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAccept = async (id: string): Promise<void> => {
    try {
      const res = await requestApi.accept(id);
      if (res === "success") {
        toast.success("Request accepted");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const res = await requestApi.reject(id);
      if (res === "success") {
        toast.success("Request rejected");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 py-10 max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Follow Requests
        </h1>
        <p className="text-black/40 dark:text-white/40 text-sm mt-1">
          {requests.length} pending{" "}
          {requests.length === 1 ? "request" : "requests"}
        </p>
      </div>

      <div className="space-y-2">
        {requests.length === 0 ? (
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
                {r.sender.avatar ? (
                  <Image
                    src={r.sender.avatar}
                    alt={r.sender.name}
                    width={44}
                    height={44}
                    className="rounded-full object-cover ring-2 ring-black/5 dark:ring-white/5"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-semibold ring-2 ring-black/10 dark:ring-white/10">
                    {r.sender.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
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
