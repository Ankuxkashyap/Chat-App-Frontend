"use client";

import { RequestApi } from "@/store/request";
import { Search, UserPlus, Check } from "lucide-react";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  username: string;
  avatar: string;
};

const dummyUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    username: "johnd",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 2,
    name: "Jane Smith",
    username: "janes",
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: 3,
    name: "Alice Johnson",
    username: "alicej",
    avatar: "https://i.pravatar.cc/40?img=3",
  },
  {
    id: 4,
    name: "Bob Brown",
    username: "bobb",
    avatar: "https://i.pravatar.cc/40?img=4",
  },
];

const AddFriendPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [followed, setFollowed] = useState<number[]>([]);

  useEffect(() => {
    const getRequest = async () => {
      try {
        await RequestApi.get();
      } catch (err) {
        console.log(err);
      }
    };
    getRequest();
  }, []);

  const filteredUsers = dummyUsers.filter(
    (user) =>
      searchTerm &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleFollow = (id: number) => {
    setFollowed((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-md mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Add Friend
          </h1>
          <p className="text-black/40 dark:text-white/40 text-sm mt-1">
            Search for people you know
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30"
            size={16}
          />
          <input
            type="text"
            placeholder="Find friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-sm transition-all"
          />
        </div>

        {/* User List */}
        <div className="space-y-2">
          {filteredUsers.length === 0 && searchTerm ? (
            <p className="text-black/30 dark:text-white/30 text-center py-12 text-sm">
              No users found
            </p>
          ) : !searchTerm ? (
            <p className="text-black/30 dark:text-white/30 text-center py-12 text-sm">
              Start typing to search
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-black/8 dark:border-white/8 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-black/5 dark:ring-white/5"
                  />
                  <div>
                    <p className="font-semibold text-black dark:text-white tracking-tight">
                      {user.name}
                    </p>
                    <p className="text-black/40 dark:text-white/40 text-xs">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleFollow(user.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all duration-200 tracking-wide ${
                    followed.includes(user.id)
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : "border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white"
                  }`}
                >
                  {followed.includes(user.id) ? (
                    <>
                      <Check className="w-3 h-3" />
                      Request
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      Follow
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFriendPage;
