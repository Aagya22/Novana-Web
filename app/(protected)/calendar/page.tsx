"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Bell,
  MoreHorizontal,
  Filter,
  Search,
  PlusCircle,
  Eye,
  Edit3,
  Trash2,
  BookOpen,
  SmilePlus,
  Target,
  Dumbbell,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "appointment" | "reminder" | "habit" | "exercise" | "journal" | "mood";
  description?: string;
  location?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Mock events for demonstration
  useEffect(() => {
    setEvents([
      {
        id: "1",
        title: "Morning Workout",
        date: new Date().toISOString().split('T')[0],
        time: "07:00",
        type: "exercise",
        description: "30 min cardio session",
        location: "Home Gym"
      },
      {
        id: "2", 
        title: "Journal Entry",
        date: new Date().toISOString().split('T')[0],
        time: "21:00",
        type: "journal",
        description: "Evening reflection"
      },
      {
        id: "3",
        title: "Meditation",
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: "08:00",
        type: "habit",
        description: "Daily mindfulness practice"
      },
      {
        id: "4",
        title: "Mood Check-in",
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        time: "20:00",
        type: "mood",
        description: "Daily mood tracking"
      }
    ]);
  }, []);

  const getTypeColor = (type: string) => {
    const colors = {
      appointment: "#3b82f6",
      reminder: "#f59e0b",
      habit: "#10b981",
      exercise: "#ef4444",
      journal: "#8b5cf6", 
      mood: "#06b6d4"
    };
    return colors[type as keyof typeof colors] || "#6b7280";
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      appointment: Calendar,
      reminder: Bell,
      habit: Target,
      exercise: Dumbbell,
      journal: BookOpen,
      mood: SmilePlus
    };
    return icons[type as keyof typeof icons] || Calendar;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getDayEvents = (day: number) => {
    const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ height: "120px" }} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getDayEvents(day);
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentDate.getMonth() && 
                     new Date().getFullYear() === currentDate.getFullYear();
      
      days.push(
        <div
          key={day}
          style={{
            height: "120px",
            border: "1px solid rgba(216,149,155,0.2)",
            borderRadius: "8px",
            padding: "8px",
            background: isToday 
              ? "linear-gradient(135deg, rgba(216,149,155,0.1), rgba(130,150,114,0.1))"
              : "rgba(255,255,255,0.7)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            if (!isToday) {
              e.currentTarget.style.background = "rgba(255,255,255,0.9)";
              e.currentTarget.style.transform = "scale(1.02)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isToday) {
              e.currentTarget.style.background = "rgba(255,255,255,0.7)";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
        >
          <div style={{
            fontWeight: isToday ? "700" : "600",
            color: isToday ? "#344C3D" : "#1f2937",
            marginBottom: "4px",
            fontSize: isToday ? "16px" : "14px"
          }}>
            {day}
          </div>
          
          {dayEvents.slice(0, 3).map((event, index) => (
            <div
              key={event.id}
              style={{
                fontSize: "10px",
                padding: "2px 6px",
                marginBottom: "2px",
                borderRadius: "4px",
                background: `${getTypeColor(event.type)}20`,
                color: getTypeColor(event.type),
                border: `1px solid ${getTypeColor(event.type)}40`,
                fontWeight: "500",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {event.time} {event.title}
            </div>
          ))}
          
          {dayEvents.length > 3 && (
            <div style={{
              fontSize: "10px",
              color: "#6b7280",
              fontWeight: "600",
              padding: "2px 6px"
            }}>
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f4f3f1 0%, #e8f0e6 50%, #f2d1d4 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <Header />
      <Sidebar />

      <main style={{
        marginLeft: "0",
        padding: "32px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}>
        {/* Page Header */}
        <div style={{
          background: "rgba(255,255,255,0.9)",
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "32px",
          border: "1px solid rgba(216,149,155,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #D8959B, #829672)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 8px 24px rgba(216,149,155,0.3)"
              }}>
                <Calendar size={28} strokeWidth={2} />
              </div>
              <div>
                <h1 style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#1f2937",
                  margin: 0,
                  background: "linear-gradient(135deg, #1f2937, #344C3D)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}>
                  Calendar
                </h1>
                <p style={{
                  color: "#6b7280",
                  fontSize: "16px",
                  margin: "4px 0 0 0",
                  fontWeight: "500"
                }}>
                  Track your wellness schedule • {events.length} upcoming events
                </p>
              </div>
              
              {/* View Toggle */}
              <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
                {["month", "week", "day"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    style={{
                      padding: "8px 16px",
                      background: viewMode === mode 
                        ? "linear-gradient(135deg, #344C3D, #829672)"
                        : "rgba(255,255,255,0.8)",
                      color: viewMode === mode ? "white" : "#6b7280",
                      border: "1px solid rgba(216,149,155,0.2)",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      textTransform: "capitalize"
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setShowEventForm(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 24px",
                background: "linear-gradient(135deg, #344C3D, #829672)",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 24px rgba(52,76,61,0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(52,76,61,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(52,76,61,0.3)";
              }}
            >
              <PlusCircle size={20} strokeWidth={2} />
              New Event
            </button>
          </div>

          {/* Search and Filter */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(242,209,212,0.3)",
              border: "1px solid rgba(216,149,155,0.2)",
              borderRadius: "12px",
              padding: "12px 16px",
              flex: 1,
              maxWidth: "400px"
            }}>
              <Search size={18} color="#6b7280" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#1f2937",
                  fontSize: "14px",
                  width: "100%",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "500"
                }}
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: "12px 16px",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(216,149,155,0.2)",
                borderRadius: "12px",
                color: "#1f2937",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <option value="all">All Types</option>
              <option value="appointment">Appointments</option>
              <option value="reminder">Reminders</option>
              <option value="habit">Habits</option>
              <option value="exercise">Exercises</option>
              <option value="journal">Journal</option>
              <option value="mood">Mood</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "32px" }}>
          {/* Main Calendar */}
          <div style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid rgba(216,149,155,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
          }}>
            {/* Calendar Header */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              marginBottom: "24px" 
            }}>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                style={{
                  padding: "12px",
                  background: "rgba(216,149,155,0.1)",
                  border: "1px solid rgba(216,149,155,0.2)",
                  borderRadius: "12px",
                  color: "#D8959B",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <ChevronLeft size={20} strokeWidth={2} />
              </button>

              <h2 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1f2937",
                margin: 0
              }}>
                {formatDate(currentDate)}
              </h2>

              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                style={{
                  padding: "12px",
                  background: "rgba(216,149,155,0.1)",
                  border: "1px solid rgba(216,149,155,0.2)",
                  borderRadius: "12px",
                  color: "#D8959B",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <ChevronRight size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "1px",
                marginBottom: "8px"
              }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div
                    key={day}
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "700",
                      color: "#6b7280",
                      fontSize: "14px",
                      background: "rgba(216,149,155,0.05)"
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px"
              }}>
                {renderCalendarGrid()}
              </div>
            </div>
          </div>

          {/* Sidebar - Upcoming Events */}
          <div style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid rgba(216,149,155,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
            height: "fit-content"
          }}>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 20px 0"
            }}>
              Upcoming Events
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredEvents.slice(0, 6).map((event) => {
                const IconComponent = getTypeIcon(event.type);
                
                return (
                  <div
                    key={event.id}
                    style={{
                      padding: "16px",
                      background: `${getTypeColor(event.type)}08`,
                      border: `1px solid ${getTypeColor(event.type)}20`,
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${getTypeColor(event.type)}15`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${getTypeColor(event.type)}08`;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <div style={{
                        padding: "6px",
                        background: `${getTypeColor(event.type)}20`,
                        borderRadius: "8px",
                        color: getTypeColor(event.type)
                      }}>
                        <IconComponent size={14} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1f2937",
                          marginBottom: "2px"
                        }}>
                          {event.title}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "500"
                        }}>
                          {event.time} • {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {event.description && (
                      <p style={{
                        fontSize: "12px",
                        color: "#4b5563",
                        margin: 0,
                        lineHeight: "1.4"
                      }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                );
              })}
              
              {filteredEvents.length === 0 && (
                <div style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "#6b7280"
                }}>
                  <Calendar size={32} style={{ opacity: 0.5, marginBottom: "12px" }} />
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    No upcoming events
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Event Form Modal */}
      {showEventForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(8px)"
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 24px 0"
            }}>
              Create New Event
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <input
                type="text"
                placeholder="Event title"
                style={{
                  padding: "16px",
                  border: "1px solid rgba(216,149,155,0.3)",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontFamily: "'Inter', sans-serif",
                  background: "rgba(255,255,255,0.8)"
                }}
              />
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <input
                  type="date"
                  style={{
                    padding: "16px",
                    border: "1px solid rgba(216,149,155,0.3)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontFamily: "'Inter', sans-serif",
                    background: "rgba(255,255,255,0.8)"
                  }}
                />
                <input
                  type="time"
                  style={{
                    padding: "16px",
                    border: "1px solid rgba(216,149,155,0.3)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontFamily: "'Inter', sans-serif",
                    background: "rgba(255,255,255,0.8)"
                  }}
                />
              </div>
              
              <select
                style={{
                  padding: "16px",
                  border: "1px solid rgba(216,149,155,0.3)",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontFamily: "'Inter', sans-serif",
                  background: "rgba(255,255,255,0.8)"
                }}
              >
                <option value="">Select event type</option>
                <option value="appointment">Appointment</option>
                <option value="reminder">Reminder</option>
                <option value="habit">Habit</option>
                <option value="exercise">Exercise</option>
                <option value="journal">Journal</option>
                <option value="mood">Mood</option>
              </select>
              
              <textarea
                placeholder="Description (optional)"
                rows={3}
                style={{
                  padding: "16px",
                  border: "1px solid rgba(216,149,155,0.3)",
                  borderRadius: "12px",
                  fontSize: "16px",
                  resize: "vertical",
                  fontFamily: "'Inter', sans-serif",
                  background: "rgba(255,255,255,0.8)"
                }}
              />
              
              <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowEventForm(false)}
                  style={{
                    padding: "16px 24px",
                    background: "transparent",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    color: "#6b7280",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: "16px 24px",
                    background: "linear-gradient(135deg, #344C3D, #829672)",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}