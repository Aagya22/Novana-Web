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
  User,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
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

      const [jRes, eRes, hRes, mRes] = await Promise.all([
        fetch(API.JOURNALS.LIST, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API.EXERCISES.LIST, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API.HABITS.LIST, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API.MOODS.LIST, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const jData = await jRes.json();
      const eData = await eRes.json();
      const hData = await hRes.json();
      const mData = await mRes.json();

      if (jData?.success) setJournalCount(jData.data.length);
      if (eData?.success) setExercisesCount(eData.data.length);
      if (hData?.success) setHabitsCount(hData.data.length);
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

  const handleCardClick = (id: string) => {
    router.push(`/${id}`);
  };

  const cards = [
    { id: "journal", label: "Journal", desc: "Write your daily thoughts", Icon: BookOpen, color: "#D8959B" },
    { id: "exercises", label: "Exercises", desc: "Track your workouts", Icon: Dumbbell, color: "#829672" },
    { id: "mood", label: "Mood Tracker", desc: "Monitor your emotions", Icon: SmilePlus, color: "#344C3D" },
    { id: "habits", label: "Habits", desc: "Build consistency", Icon: FileText, color: "#D8959B" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f4f3f1 0%, #e8f0e6 50%, #f2d1d4 100%)",
        transition: "background 0.3s ease",
      }}
    >
      <Header />

      {/* FLEX LAYOUT FIX */}
      <div style={{ display: "flex" }}>
        <Sidebar />

        <main
          style={{
            flex: 1,
            padding: "32px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* Welcome */}
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Welcome back, {userName || "User"}
          </h1>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            <StatCard title="Journal Entries" value={journalCount.toString()} icon={BookOpen} />
            <StatCard title="Current Mood" value={currentMood || "Not set"} icon={SmilePlus} />
            <StatCard title="Exercises" value={exercisesCount.toString()} icon={Dumbbell} />
            <StatCard title="Active Habits" value={habitsCount.toString()} icon={Target} />
          </div>

          {/* Feature Cards */}
          <div style={{ display: "grid", gap: "16px" }}>
            {cards.map((card) => {
              const Icon = card.Icon;
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  style={{
                    padding: "20px",
                    background: "#ffffff",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <Icon size={22} color={card.color} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{card.label}</div>
                      <div style={{ fontSize: "14px", opacity: 0.6 }}>
                        {card.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={18} />
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: any;
}) {
  return (
    <div
      style={{
        padding: "24px",
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Icon size={24} style={{ marginBottom: "12px" }} />
      <div style={{ fontSize: "28px", fontWeight: 700 }}>{value}</div>
      <div style={{ opacity: 0.6 }}>{title}</div>
    </div>
  );
}
