"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import {
  BookOpen,
  Dumbbell,
  SmilePlus,
  FileText,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API } from "../../../lib/api/endpoints";

interface Reminder {
  _id: string;
  title: string;
  time: string;
  done: boolean;
}

export default function Page() {
  const router = useRouter();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const [journalCount, setJournalCount] = useState(0);
  const [exercisesCount, setExercisesCount] = useState(0);
  const [habitsCount, setHabitsCount] = useState(0);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview();
    fetchReminders();
  }, []);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem("token");

      const who = await fetch(API.AUTH.WHOAMI, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const whoData = await who.json();
      if (whoData?.success) {
        setUserName(whoData.data?.fullName || whoData.data?.username);
      }

      const jRes = await fetch(API.JOURNALS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jData = await jRes.json();
      if (jData?.success) setJournalCount(jData.data.length);

      const eRes = await fetch(API.EXERCISES.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const eData = await eRes.json();
      if (eData?.success) setExercisesCount(eData.data.length);

      const hRes = await fetch(API.HABITS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hData = await hRes.json();
      if (hData?.success) setHabitsCount(hData.data.length);

      const mRes = await fetch(API.MOODS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mData = await mRes.json();
      if (mData?.success && mData.data.length > 0) {
        setCurrentMood(mData.data[mData.data.length - 1].mood);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.REMINDERS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReminders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = async (id: string) => {
    const token = localStorage.getItem("token");

    await fetch(API.REMINDERS.TOGGLE(id), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    setReminders((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, done: !r.done } : r
      )
    );
  };

  const handleCardClick = (id: string) => {
    router.push(`/${id}`);
  };

  const cards = [
    {
      id: "journal",
      label: "Journal",
      desc: "Write your daily thoughts",
      Icon: BookOpen,
      color: "#f6c445",
    },
    {
      id: "exercises",
      label: "Exercises",
      desc: "Track your workouts",
      Icon: Dumbbell,
      color: "#5b8def",
    },
    {
      id: "mood",
      label: "Mood Tracker",
      desc: "Monitor your emotions",
      Icon: SmilePlus,
      color: "#ff7a9a",
    },
    {
      id: "habits",
      label: "Habits",
      desc: "Build consistency",
      Icon: FileText,
      color: "#9b7bff",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f4f8fb" }}>
      <Header />
      <Sidebar />

      <main
        style={{
          padding: "32px",
          marginLeft: "240px",
          display: "flex",
          gap: "30px",
        }}
      >
        {/* LEFT SECTION */}
        <div style={{ flex: 1 }}>
          {/* WELCOME CARD */}
          <div
            style={{
              background: "#d4edda",
              padding: 24,
              borderRadius: 20,
              marginBottom: 24,
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ margin: 0, color: "#155724" }}>
              Welcome back, {userName || "User"}! 👋
            </h2>
          </div>

          {/* OVERVIEW CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <GradientCard
              title="Journal Entries"
              value={journalCount}
              gradient="linear-gradient(135deg, #f6d365, #fda085)"
            />
            <GradientCard
              title="Today's Mood"
              value={currentMood || "—"}
              gradient="linear-gradient(135deg, #89f7fe, #66a6ff)"
            />
            <GradientCard
              title="Exercises Done"
              value={exercisesCount}
              gradient="linear-gradient(135deg, #f093fb, #f5576c)"
            />
            <GradientCard
              title="Habits Tracked"
              value={habitsCount}
              gradient="linear-gradient(135deg, #c471f5, #fa71cd)"
            />
          </div>

          {/* FEATURE CARDS */}
          <div style={{ display: "grid", gap: 20 }}>
            {cards.map((card) => {
              const Icon = card.Icon;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  style={{
                    background: "#fff",
                    padding: 24,
                    borderRadius: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                >
                  <div style={{ display: "flex", gap: 16 }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 16,
                        background: `${card.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: card.color,
                      }}
                    >
                      <Icon size={28} />
                    </div>

                    <div>
                      <h4 style={{ margin: 0 }}>{card.label}</h4>
                      <p style={{ margin: "6px 0", color: "#777" }}>
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  <span style={{ color: "#999" }}>→</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT REMINDER PANEL */}
        <div style={{ width: 300 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ marginBottom: 16 }}>
              <Bell size={16} /> Reminders
            </h3>

            {loading ? (
              <p>Loading...</p>
            ) : (
              reminders.map((r) => (
                <div
                  key={r._id}
                  onClick={() => router.push('/reminders')}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: r.done ? "#e6f7ee" : "#f2f4f7",
                    marginBottom: 10,
                    cursor: "pointer",
                  }}
                >
                  {r.title} — {r.time}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* GRADIENT OVERVIEW CARD */
function GradientCard({
  title,
  value,
  gradient,
}: {
  title: string;
  value: any;
  gradient: string;
}) {
  return (
    <div
      style={{
        background: gradient,
        borderRadius: 20,
        padding: 24,
        color: "#fff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: 0, opacity: 0.9 }}>{title}</p>
      <h2 style={{ marginTop: 10 }}>{value}</h2>
    </div>
  );
}
