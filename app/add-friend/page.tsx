"use client";

import { RequestApi } from "@/store/request";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

const AddFriendPage = () => {
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
  type User = {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };

  // Dummy user data
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

  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = dummyUsers.filter(
    (user) =>
      searchTerm &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="max-w-3xl p-4 mx-auto">
      <h1 className="text-xl text-center font-semibold mb-6">Add Friend</h1>
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Find friends"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full dark:text-white placeholder-gray-400 rounded-full pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
        />
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 && searchTerm ? (
          <p className="text-gray-400 text-center">No users found</p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-gray-800 p-3 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-gray-400 text-sm">@{user.username}</p>
                </div>
              </div>
              <button className="flex items-center space-x-1 bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-600">
                <span className="text-white font-semibold">+</span>
                <span>Add</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddFriendPage;
