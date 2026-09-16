/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './components/views/HomeView';
import { EventsView } from './components/views/EventsView';
import { SocietiesView } from './components/views/SocietiesView';
import { MessagesView } from './components/views/MessagesView';
import { CalendarView } from './components/views/CalendarView';
import { OpportunitiesView } from './components/views/OpportunitiesView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { EventModal } from './components/EventModal';
import { OpportunityModal } from './components/OpportunityModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { StreamParserModal } from './components/StreamParserModal';
import { ShareEventModal } from './components/ShareEventModal';
import { RegistrationModal } from './components/RegistrationModal';
import { EditEventModal } from './components/EditEventModal';
import { AiNovaModal } from './components/AiNovaModal';
import { LoginPage } from './components/LoginPage';
import {
  NavTab,
  CampusEvent,
  Society,
  Deadline,
  Opportunity,
  ScheduleItem,
  ChatChannel,
  NotificationItem,
  MessageItem,
  EventRegistrationData,
  UserProfile,
} from './types';
import {
  INITIAL_EVENTS,
  INITIAL_SOCIETIES,
  INITIAL_DEADLINES,
  INITIAL_OPPORTUNITIES,
  INITIAL_SCHEDULE,
  INITIAL_CHANNELS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_USER,
} from './data/mockData';
import { getStudent } from './services/studentService';
import {
  fetchSocieties,
  fetchEventsApi,
  postAnnouncementApi,
} from './services/societyApiService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('univia_current_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch {}
    return DEFAULT_USER;
  });
  const isGuest = false;
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const savedUser = localStorage.getItem('univia_current_user');
      const token = localStorage.getItem('univia_session_token');
      if (savedUser && token) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  // Source of Truth: Fetch latest Student Profile from MongoDB on initial mount / login
  useEffect(() => {
    if (!isLoggedIn) return;

    const identifier =
      currentUser._id ||
      currentUser.studentId ||
      currentUser.campusCardId ||
      currentUser.email;

    if (!identifier) return;

    let isMounted = true;
    getStudent(identifier)
      .then((mongoProfile) => {
        if (isMounted && mongoProfile) {
          setCurrentUser((prev) => {
            const preservedIsNewUser = Boolean(prev.isNewUser || mongoProfile.isNewUser);
            const merged = {
              ...prev,
              ...mongoProfile,
              isNewUser: preservedIsNewUser,
            };
            try {
              localStorage.setItem('univia_current_user', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch((err) => {
        console.info('[MongoDB Source of Truth] Using local session cache while connecting:', err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  // Sync Societies & Events from MongoDB Knowledge Base for campus-wide availability
  useEffect(() => {
    let isMounted = true;
    fetchSocieties()
      .then((dbSocieties) => {
        if (isMounted && dbSocieties && dbSocieties.length > 0) {
          setSocieties((prev) => {
            const mapped: Society[] = dbSocieties.map((d: any) => ({
              id: d.societyId || d._id,
              name: d.name,
              category: d.category,
              memberCount: d.memberCount || 1,
              description: d.description,
              avatar: d.avatar || '🏛️',
              imageUrl: d.imageUrl || d.coverImage || '',
              coverImage: d.coverImage || d.imageUrl || '',
              bannerColor: d.bannerColor || 'from-[#7033F5] to-[#8F52FF]',
              tags: [d.category, 'Campus Guild'],
              meetingSchedule: d.meetingSchedule || 'TBA',
              location: d.location || 'Campus Center',
              isJoined: false,
              communityId: d.communityId || `comm-${d.societyId}`,
            }));

            return mapped.map((m) => {
              const existing = prev.find(
                (p) => p.id === m.id || p.name.toLowerCase() === m.name.toLowerCase()
              );
              return existing
                ? {
                    ...m,
                    imageUrl: m.imageUrl || existing.imageUrl,
                    coverImage: m.coverImage || existing.coverImage,
                    avatar: m.avatar || existing.avatar,
                    isJoined: existing.isJoined,
                    memberCount: Math.max(m.memberCount, existing.memberCount),
                  }
                : m;
            });
          });
        }
      })
      .catch(() => {});

    fetchEventsApi()
      .then((dbEvents) => {
        if (isMounted && dbEvents && dbEvents.length > 0) {
          setEvents((prev) => {
            const mapped: CampusEvent[] = dbEvents.map((e: any) => ({
              id: e.eventId || e._id,
              title: e.title,
              society: e.societyName,
              societyAvatar: '',
              date: e.dateText || (e.date ? new Date(e.date).toLocaleDateString() : 'Upcoming'),
              time: e.timeText || 'TBA',
              location: e.venue || 'Campus Venue',
              category: (e.category as any) || 'Tech & Innovation',
              attendeesCount: e.rsvpCount || 0,
              maxAttendees: e.maxAttendees || 100,
              isRsvpd: false,
              imageColor: 'from-[#7033F5] to-[#8C52FF]',
              tags: e.tags || ['Campus', 'Society'],
              description: e.description || '',
              isToday: false,
              status: 'APPROVED',
            }));

            const existingIds = new Set(mapped.map((m) => m.id));
            const leftovers = prev.filter((p) => !existingIds.has(p.id));
            return [...mapped, ...leftovers];
          });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const { theme: themeMode, setTheme: setThemeMode } = useTheme();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Core Data States:
  // Campus-wide content is accessible to all students
  const [events, setEvents] = useState<CampusEvent[]>(() => INITIAL_EVENTS);
  const [societies, setSocieties] = useState<Society[]>(() => INITIAL_SOCIETIES);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => INITIAL_OPPORTUNITIES);

  // Personal user data: Empty for new signup users and guests, populated for demo student
  const isCleanStateUser = Boolean(
    currentUser.isNewUser ||
    currentUser.isGuest ||
    currentUser.role === 'Guest'
  );

  const [deadlines, setDeadlines] = useState<Deadline[]>(() =>
    isCleanStateUser ? [] : INITIAL_DEADLINES
  );
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    if (currentUser.schedule && currentUser.schedule.length > 0) {
      return currentUser.schedule;
    }
    return isCleanStateUser ? [] : INITIAL_SCHEDULE;
  });
  const [channels, setChannels] = useState<ChatChannel[]>(() => {
    try {
      // Clear out legacy default saved chats so messages starts clean
      const cleaned = localStorage.getItem('univia_default_chats_purged_v3');
      if (!cleaned) {
        localStorage.removeItem('univia_user_channels');
        localStorage.setItem('univia_default_chats_purged_v3', 'true');
        return [];
      }
      const saved = localStorage.getItem('univia_user_channels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Exclude any default mock chats
          return parsed.filter(
            (c: any) =>
              c &&
              c.id &&
              !c.id.startsWith('chan-') &&
              !c.id.startsWith('mock-') &&
              !['c-1', 'c-2', 'c-3', 'c-4', 'comm-1', 'comm-2', 'comm-3'].includes(c.id) &&
              !['AssetMerkle IGDTUW', 'TEDx IGDTUW', 'WiCS Guild', 'Hackathon Warriors'].includes(c.name)
          );
        }
      }
    } catch {}
    return [];
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    isCleanStateUser ? [] : INITIAL_NOTIFICATIONS
  );

  // Persist channels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('univia_user_channels', JSON.stringify(channels));
    } catch {}
  }, [channels]);

  const handleDeleteChannel = (channelId: string) => {
    setChannels((prev) => {
      const updated = prev.filter((c) => c.id !== channelId);
      try {
        localStorage.setItem('univia_user_channels', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (selectedChannelId === channelId) {
      setSelectedChannelId('');
    }
  };

  const handleClearAllChannels = () => {
    setChannels([]);
    setSelectedChannelId('');
    try {
      localStorage.removeItem('univia_user_channels');
    } catch {}
  };

  // Selected Channel for Messages - starts empty until selected or created
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');

  // Modals & Navigation Drawers
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isStreamParserOpen, setIsStreamParserOpen] = useState(false);
  const [isAiNovaOpen, setIsAiNovaOpen] = useState(false);

  // Dedicated Modals for Events
  const [sharingEvent, setSharingEvent] = useState<CampusEvent | null>(null);
  const [registeringEvent, setRegisteringEvent] = useState<CampusEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);

  // Import parsed items from Stream Parser
  const handleImportStreamEvent = (newEvent: CampusEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-stream-${Date.now()}`,
        title: `AI Stream Ingested: ${newEvent.title}`,
        description: `Imported event from campus announcements to ${newEvent.location}.`,
        timeAgo: 'Just now',
        isRead: false,
        type: 'event',
      },
      ...prev,
    ]);
  };

  const handleImportStreamOpportunity = (newOpp: Opportunity) => {
    setOpportunities((prev) => [newOpp, ...prev]);
  };

  // Total Unread Messages
  const unreadMessagesCount = channels.reduce(
    (sum, ch) => sum + ch.unreadCount,
    0
  );

  // Navigate directly to a specific community channel from any card/view
  const handleNavigateToCommunity = (communityId: string) => {
    setSelectedChannelId(communityId);
    setActiveTab('messages');
  };

  // RSVP Handler - Ensures events are NEVER erased from board, accurately toggles Going vs Not Going
  const handleToggleRsvp = (id: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === id) {
          const nextRsvpd = !evt.isRsvpd;
          const nextCount = nextRsvpd
            ? evt.attendeesCount + 1
            : Math.max(0, evt.attendeesCount - 1);

          // Add feedback notification
          if (nextRsvpd) {
            setNotifications((n) => [
              {
                id: `notif-${Date.now()}`,
                title: `RSVP Confirmed: ${evt.title}`,
                description: `You're marked as Going. Meet at ${evt.location} on ${evt.date}.`,
                timeAgo: 'Just now',
                isRead: false,
                type: 'event',
              },
              ...n,
            ]);
          } else {
            setNotifications((n) => [
              {
                id: `notif-${Date.now()}`,
                title: `Status: Not Going`,
                description: `You're marked as Not Going for "${evt.title}". The event remains on your campus board.`,
                timeAgo: 'Just now',
                isRead: false,
                type: 'event',
              },
              ...n,
            ]);
          }

          const updated: CampusEvent = {
            ...evt,
            isRsvpd: nextRsvpd,
            attendeesCount: nextCount,
          };
          if (selectedEvent?.id === id) {
            setSelectedEvent(updated);
          }
          return updated;
        }
        return evt;
      })
    );
  };

  // Join / Leave Society Handler (synchronizes society & community channel)
  const handleToggleJoinSociety = (id: string) => {
    setSocieties((prev) =>
      prev.map((soc) => {
        if (soc.id === id) {
          const nextJoined = !soc.isJoined;
          const nextMemberCount = nextJoined
            ? soc.memberCount + 1
            : Math.max(0, soc.memberCount - 1);

          if (nextJoined) {
            setNotifications((n) => [
              {
                id: `notif-${Date.now()}`,
                title: `Welcome to ${soc.name}!`,
                description: `You are now a registered member. The ${soc.name} community channel is open for you.`,
                timeAgo: 'Just now',
                isRead: false,
                type: 'society',
              },
              ...n,
            ]);
          }

          // Sync channel if exists
          if (soc.communityId) {
            setChannels((chList) =>
              chList.map((ch) =>
                ch.id === soc.communityId
                  ? {
                      ...ch,
                      isJoined: nextJoined,
                      memberCount: nextMemberCount,
                    }
                  : ch
              )
            );
          }

          return {
            ...soc,
            isJoined: nextJoined,
            memberCount: nextMemberCount,
          };
        }
        return soc;
      })
    );
  };

  // Register New Campus Society Handler (MongoDB connected)
  const handleCreateSociety = (newSoc: Society) => {
    setSocieties((prev) => [newSoc, ...prev]);

    // Automatically create official chat channel
    const newChan: ChatChannel = {
      id: newSoc.communityId || `comm-${newSoc.id}`,
      societyId: newSoc.id,
      name: `${newSoc.name} Official`,
      isDirect: false,
      roleOrCategory: newSoc.category,
      unreadCount: 0,
      lastMessage: 'Official announcements channel initialized',
      lastMessageTime: 'Just now',
      memberCount: newSoc.memberCount || 1,
      description: newSoc.description,
      avatar: newSoc.avatar,
      isOfficial: true,
      messages: [
        {
          id: `msg-soc-${Date.now()}`,
          senderId: currentUser.campusCardId || 'sys',
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          isSelf: true,
          content: `📢 Welcome to the official channel for ${newSoc.name}! Announcements and notices posted here are shared directly with verified students.`,
          timestamp: 'Just now',
          status: 'delivered',
        },
      ],
    };

    setChannels((prev) => [newChan, ...prev]);
    setNotifications((n) => [
      {
        id: `notif-soc-${Date.now()}`,
        title: `🎉 Society Registered: ${newSoc.name}`,
        description: `Stored in MongoDB database. Searchable across campus and indexed for Nova.`,
        timeAgo: 'Just now',
        isRead: false,
        type: 'society',
      },
      ...n,
    ]);
  };

  // Toggle join from within community messages panel
  const handleToggleJoinCommunity = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === channelId) {
          const nextJoined = !ch.isJoined;
          const nextCount = (ch.memberCount || 1) + (nextJoined ? 1 : -1);

          // Synchronize matching society
          setSocieties((socs) =>
            socs.map((s) =>
              s.communityId === channelId
                ? { ...s, isJoined: nextJoined, memberCount: nextCount }
                : s
            )
          );

          return {
            ...ch,
            isJoined: nextJoined,
            memberCount: nextCount,
          };
        }
        return ch;
      })
    );
  };

  // Deadline Complete Handler
  const handleToggleDeadlineComplete = (id: string) => {
    setDeadlines((prev) =>
      prev.map((dl) =>
        dl.id === id ? { ...dl, isCompleted: !dl.isCompleted } : dl
      )
    );
  };

  // Opportunity Bookmark Handler
  const handleToggleOpportunitySave = (id: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === id) {
          const updated = { ...opp, isSaved: !opp.isSaved };
          if (selectedOpportunity?.id === id) {
            setSelectedOpportunity(updated);
          }
          return updated;
        }
        return opp;
      })
    );
  };

  // Apply to Opportunity Handler
  const handleApplyOpportunity = (id: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === id) {
          const updated = { ...opp, hasApplied: true };
          if (selectedOpportunity?.id === id) {
            setSelectedOpportunity(updated);
          }
          // Notification
          setNotifications((n) => [
            {
              id: `notif-${Date.now()}`,
              title: `Application submitted: ${opp.title}`,
              description: `Confirmation sent to ${opp.organization}. They will review your student portfolio.`,
              timeAgo: 'Just now',
              isRead: false,
              type: 'message',
            },
            ...n,
          ]);
          return updated;
        }
        return opp;
      })
    );
  };

  // Add Event Handler - Default PENDING status with automated routing to tagged societies & Super Admin
  const handleAddEvent = (
    newEvent: Omit<CampusEvent, 'id' | 'attendeesCount' | 'isRsvpd'>
  ) => {
    const tagged = newEvent.taggedSocieties && newEvent.taggedSocieties.length > 0
      ? newEvent.taggedSocieties
      : [newEvent.society];

    const created: CampusEvent = {
      ...newEvent,
      id: `evt-${Date.now()}`,
      attendeesCount: 1,
      isRsvpd: true,
      status: 'PENDING', // Default to PENDING per architectural mandate
      taggedSocieties: tagged,
      proposedBy: {
        name: currentUser.name,
        studentId: currentUser.campusCardId,
        avatar: currentUser.avatar,
      },
    };

    setEvents((prev) => [created, ...prev]);

    // Dispatch automated routing notifications to tagged societies and Super Admin
    const societiesListStr = tagged.join(', ');
    setNotifications((n) => [
      {
        id: `notif-proposal-${Date.now()}`,
        title: `Proposal Submitted: ${created.title}`,
        description: `Status: PENDING. Routed to [${societiesListStr}] and synced to Super Admin review queue (Ridhi Jain).`,
        timeAgo: 'Just now',
        isRead: false,
        type: 'event',
      },
      ...n,
    ]);

    // Background sync to API
    fetch('/api/events/propose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: created.title,
        society: created.society,
        date: created.date,
        time: created.time,
        location: created.location,
        category: created.category,
        description: created.description,
        maxAttendees: created.maxAttendees,
        taggedSocieties: tagged,
        proposedBy: created.proposedBy,
      }),
    }).catch((err) => console.warn('Propose sync deferred', err));
  };

  // Super Admin Review Handler (Approve or Reject Proposal)
  const handleReviewEvent = (
    eventId: string,
    decision: 'APPROVED' | 'REJECTED',
    feedback?: string
  ) => {
    const adminName = currentUser.name || 'Ridhi Jain (Super Admin)';
    const reviewTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const updated: CampusEvent = {
            ...e,
            status: decision,
            adminReview: {
              reviewedBy: adminName,
              decision,
              reviewedAt: reviewTime,
              feedback,
            },
          };
          if (selectedEvent?.id === eventId) setSelectedEvent(updated);
          return updated;
        }
        return e;
      })
    );

    const target = events.find((e) => e.id === eventId);
    const eventTitle = target ? target.title : 'Campus Event';

    setNotifications((n) => [
      {
        id: `notif-rev-${Date.now()}`,
        title: decision === 'APPROVED' ? `✓ Event Approved: ${eventTitle}` : `Proposal Declined: ${eventTitle}`,
        description:
          decision === 'APPROVED'
            ? `Admin review complete. Broadcast to student directory.`
            : `Admin notes: ${feedback || 'Proposal did not meet campus guidelines.'}`,
        timeAgo: 'Just now',
        isRead: false,
        type: 'event',
      },
      ...n,
    ]);

    fetch(`/api/events/${eventId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision,
        feedback,
        adminId: currentUser.campusCardId,
        adminName,
      }),
    }).catch((err) => console.warn('Review sync deferred', err));
  };

  // Host Edit Event Handler
  const handleEditEvent = (updated: CampusEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (selectedEvent?.id === updated.id) {
      setSelectedEvent(updated);
    }
    setNotifications((n) => [
      {
        id: `notif-${Date.now()}`,
        title: `Event Updated: ${updated.title}`,
        description: `Your host edits (date, venue, and registration rules) were successfully saved.`,
        timeAgo: 'Just now',
        isRead: false,
        type: 'event',
      },
      ...n,
    ]);
  };

  // Event Registration Submit Handler
  const handleRegisterSubmit = (
    eventId: string,
    regData: EventRegistrationData
  ) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const updated: CampusEvent = {
            ...e,
            isRsvpd: true,
            attendeesCount: e.isRsvpd ? e.attendeesCount : e.attendeesCount + 1,
            userRegistration: regData,
          };
          if (selectedEvent?.id === eventId) setSelectedEvent(updated);
          return updated;
        }
        return e;
      })
    );
    setNotifications((n) => [
      {
        id: `notif-${Date.now()}`,
        title: `Pass Generated: Ticket #${regData.ticketId}`,
        description: `Registration confirmed for ${regData.studentName}. Your digital entry pass is ready.`,
        timeAgo: 'Just now',
        isRead: false,
        type: 'event',
      },
      ...n,
    ]);
  };

  // Cancel Event Registration Handler
  const handleCancelRegistration = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const updated: CampusEvent = {
            ...e,
            isRsvpd: false,
            attendeesCount: Math.max(0, e.attendeesCount - 1),
            userRegistration: undefined,
          };
          if (selectedEvent?.id === eventId) setSelectedEvent(updated);
          return updated;
        }
        return e;
      })
    );
    setNotifications((n) => [
      {
        id: `notif-${Date.now()}`,
        title: `Registration Cancelled`,
        description: `Your pass was released and your status changed to Not Going. The event remains on your board.`,
        timeAgo: 'Just now',
        isRead: false,
        type: 'event',
      },
      ...n,
    ]);
  };

  // Send Message Handler with replies, attachments & simulated community replies
  const handleSendMessage = (
    channelId: string,
    text: string,
    replyTo?: { id: string; senderName: string; text: string },
    attachment?: {
      type: 'image' | 'file';
      name: string;
      url: string;
      size?: string;
    }
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessage: MessageItem = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.campusCardId || currentUser.studentId || currentUser._id || 'student-self',
      senderName: currentUser.name || 'Student',
      senderAvatar: currentUser.avatar,
      isSelf: true,
      role: 'Member',
      content: text,
      timestamp: timeStr,
      replyTo,
      attachment,
      reactions: [],
    };

    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === channelId) {
          return {
            ...ch,
            lastMessage: text || (attachment ? `Sent ${attachment.name}` : ''),
            lastMessageTime: 'Just now',
            messages: [...ch.messages, newMessage],
          };
        }
        return ch;
      })
    );

    // Generic Society Announcement Ingestion:
    // Any college society message is stored in MongoDB and indexed for campus events and opportunities
    const targetChannel = channels.find((c) => c.id === channelId);
    if (targetChannel && text.trim()) {
      const cleanSocName = (targetChannel.name || 'Campus Society')
        .replace(/ Official$/, '')
        .replace(/ Team$/, '');

      postAnnouncementApi({
        societyId: targetChannel.societyId || targetChannel.id,
        societyName: cleanSocName,
        originalMessage: text.trim(),
        sender: {
          id: currentUser.campusCardId || currentUser._id || 'student',
          name: currentUser.name,
          role: currentUser.role,
          avatar: currentUser.avatar,
          email: currentUser.email,
          studentId: currentUser.studentId,
        },
        channelId: channelId,
      })
        .then((res) => {
          if (res?.success && res.data) {
            const { event, isUpdate } = res.data;
            if (event) {
              const mappedEvent: CampusEvent = {
                id: event.eventId || event._id || `evt-${Date.now()}`,
                title: event.title,
                society: event.societyName || cleanSocName,
                societyAvatar: targetChannel.avatar || '',
                date:
                  event.dateText ||
                  (event.date ? new Date(event.date).toLocaleDateString() : 'Upcoming'),
                time: event.timeText || 'TBA',
                location: event.venue || 'Campus Venue',
                category: (event.category as any) || 'Tech & Innovation',
                attendeesCount: event.rsvpCount || 0,
                maxAttendees: event.maxAttendees || 100,
                isRsvpd: false,
                imageColor: 'from-[#7033F5] to-[#8C52FF]',
                tags: event.tags || ['Campus', 'Society'],
                description: event.description || '',
                isToday: false,
                status: 'APPROVED',
              };

              setEvents((prev) => {
                const existingIdx = prev.findIndex(
                  (e) =>
                    e.id === mappedEvent.id ||
                    (e.title.toLowerCase() === mappedEvent.title.toLowerCase() &&
                      e.society.toLowerCase() === mappedEvent.society.toLowerCase())
                );
                if (existingIdx >= 0) {
                  const copy = [...prev];
                  copy[existingIdx] = { ...copy[existingIdx], ...mappedEvent };
                  return copy;
                }
                return [mappedEvent, ...prev];
              });

              setNotifications((n) => [
                {
                  id: `notif-ai-soc-${Date.now()}`,
                  title: isUpdate
                    ? `🔄 Event Updated: ${event.title}`
                    : `✨ AI Extracted Event: ${event.title}`,
                  description: `${event.societyName}: ${
                    event.dateText || 'Upcoming'
                  } at ${event.venue || 'Campus Venue'}. Synced to events calendar!`,
                  timeAgo: 'Just now',
                  isRead: false,
                  type: 'event',
                },
                ...n,
              ]);
            }
          }
        })
        .catch((err) => {
          console.info('[Society Message Ingestion Notice]', err?.message);
        });
    }
  };

  // Toggle Emoji Reaction on a Message
  const handleToggleReaction = (
    channelId: string,
    messageId: string,
    emoji: string
  ) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === channelId) {
          return {
            ...ch,
            messages: ch.messages.map((m) => {
              if (m.id === messageId) {
                const existingReactions = m.reactions || [];
                const foundReaction = existingReactions.find(
                  (r) => r.emoji === emoji
                );

                let updatedReactions;
                if (foundReaction) {
                  if (foundReaction.users.includes(currentUser.name)) {
                    // Remove user reaction
                    updatedReactions = existingReactions
                      .map((r) =>
                        r.emoji === emoji
                          ? {
                              ...r,
                              count: r.count - 1,
                              users: r.users.filter(
                                (u) => u !== currentUser.name
                              ),
                            }
                          : r
                      )
                      .filter((r) => r.count > 0);
                  } else {
                    // Add user reaction to existing emoji
                    updatedReactions = existingReactions.map((r) =>
                      r.emoji === emoji
                        ? {
                            ...r,
                            count: r.count + 1,
                            users: [...r.users, currentUser.name],
                          }
                        : r
                    );
                  }
                } else {
                  // Add new emoji reaction
                  updatedReactions = [
                    ...existingReactions,
                    { emoji, count: 1, users: [currentUser.name] },
                  ];
                }

                return {
                  ...m,
                  reactions: updatedReactions,
                };
              }
              return m;
            }),
          };
        }
        return ch;
      })
    );
  };

  // Delete own message
  const handleDeleteMessage = (channelId: string, messageId: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === channelId) {
          const filtered = ch.messages.filter((m) => m.id !== messageId);
          const lastM = filtered[filtered.length - 1];
          return {
            ...ch,
            messages: filtered,
            lastMessage: lastM ? lastM.content : 'No messages',
          };
        }
        return ch;
      })
    );
  };

  // Clear Unread Handler
  const handleClearUnread = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, unreadCount: 0 } : ch))
    );
  };

  // Notifications handlers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // View Renderer
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            events={events}
            societies={societies}
            deadlines={deadlines}
            opportunities={opportunities}
            schedule={schedule}
            onSelectTab={setActiveTab}
            onToggleRsvp={handleToggleRsvp}
            onToggleDeadlineComplete={handleToggleDeadlineComplete}
            onSelectEvent={setSelectedEvent}
            onSelectOpportunity={setSelectedOpportunity}
            onToggleOpportunitySave={handleToggleOpportunitySave}
            onNavigateToCommunity={handleNavigateToCommunity}
            currentUser={currentUser}
            isGuest={isGuest}
          />
        );
      case 'events':
        return (
          <EventsView
            events={events}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onToggleRsvp={handleToggleRsvp}
            onSelectEvent={setSelectedEvent}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onRegisterSubmit={handleRegisterSubmit}
            onCancelRegistration={handleCancelRegistration}
            currentUser={currentUser}
            onReviewEvent={handleReviewEvent}
            onPromptLogin={() => setShowAuthModal(true)}
          />
        );
      case 'societies':
        return (
          <SocietiesView
            societies={societies}
            onToggleJoinSociety={handleToggleJoinSociety}
            onSelectTab={setActiveTab}
            onNavigateToCommunity={handleNavigateToCommunity}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onCreateSociety={handleCreateSociety}
          />
        );
      case 'messages':
        return (
          <MessagesView
            channels={channels}
            selectedChannelId={selectedChannelId}
            onSelectChannel={setSelectedChannelId}
            onSendMessage={handleSendMessage}
            onClearUnread={handleClearUnread}
            onToggleReaction={handleToggleReaction}
            onDeleteMessage={handleDeleteMessage}
            onToggleJoinCommunity={handleToggleJoinCommunity}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            currentUser={currentUser}
            onAddChannel={(newChan) => {
              setChannels((prev) => [newChan, ...prev]);
              setSelectedChannelId(newChan.id);
            }}
            onDeleteChannel={handleDeleteChannel}
            onClearAllChannels={handleClearAllChannels}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            schedule={schedule}
            deadlines={deadlines}
            events={events}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onAddToSchedule={(item) => setSchedule((prev) => [item, ...prev])}
            currentUser={currentUser}
          />
        );
      case 'opportunities':
        return (
          <OpportunitiesView
            opportunities={opportunities}
            onSelectOpportunity={setSelectedOpportunity}
            onToggleOpportunitySave={handleToggleOpportunitySave}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onAddOpportunity={(newOpp) => setOpportunities((prev) => [newOpp, ...prev])}
          />
        );
      case 'profile':
        return (
          <ProfileView
            events={events}
            societies={societies}
            onToggleRsvp={handleToggleRsvp}
            onSelectEvent={setSelectedEvent}
            currentUser={currentUser}
            schedule={schedule}
            onUpdateSchedule={(newSched) => {
              setSchedule(newSched);
              const updated = { ...currentUser, schedule: newSched };
              setCurrentUser(updated);
              localStorage.setItem('univia_current_user', JSON.stringify(updated));
            }}
            onUpdateProfile={(updated) => {
              const merged = {
                ...updated,
                isNewUser: currentUser.isNewUser ?? updated.isNewUser,
              };
              setCurrentUser(merged);
              localStorage.setItem('univia_current_user', JSON.stringify(merged));
            }}
            onLogout={handleLogout}
          />
        );
      case 'settings':
        return (
          <SettingsView
            currentUser={currentUser}
            onUpdateProfile={(updated) => {
              const merged = {
                ...updated,
                isNewUser: currentUser.isNewUser ?? updated.isNewUser,
              };
              setCurrentUser(merged);
              localStorage.setItem('univia_current_user', JSON.stringify(merged));
            }}
            onLogout={handleLogout}
            themeMode={themeMode}
            onToggleTheme={setThemeMode}
          />
        );
      default:
        return null;
    }
  };

  // Secure Logout routine per architectural constraints: clears session tokens, cookies, and returns to split Gateway
  const handleLogout = async () => {
    try {
      // 1. Inform server to terminate backend session & expire auth cookie
      await fetch('/api/logout', { method: 'POST' }).catch(() => {});

      // 2. Wipe client storage
      localStorage.removeItem('univia_session_token');
      localStorage.removeItem('univia_current_user');
      localStorage.removeItem('univia_session_role');
      localStorage.removeItem('univia_user_deadlines');
      sessionStorage.clear();

      // 3. Destroy client-accessible cookies
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });
    } catch (e) {
      console.warn('Session wipe cleanup error', e);
    }

    // 4. Forcefully reset all global application states to clean slate
    setCurrentUser(DEFAULT_USER);
    setIsLoggedIn(false);
    setShowAuthModal(false);
    setActiveTab('home');
    setSearchQuery('');
    setDeadlines([]);
    setSchedule([]);
    setChannels([]);
    setNotifications([]);
    setSelectedChannelId('');

    // 5. Force viewport redirection to Gateway screen top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const applyUserData = (user: UserProfile, token?: string) => {
    if (token) {
      localStorage.setItem('univia_session_token', token);
    }
    localStorage.setItem('univia_current_user', JSON.stringify(user));
    setCurrentUser(user);

    // Campus-wide content is accessible to all students
    setSocieties(INITIAL_SOCIETIES);
    setEvents(INITIAL_EVENTS);
    setOpportunities(INITIAL_OPPORTUNITIES);

    const isCleanState = Boolean(
      user.isNewUser ||
      user.isGuest ||
      user.role === 'Guest'
    );

    if (isCleanState) {
      // New users start with a clean personal state
      setDeadlines([]);
      setSchedule(user.schedule && user.schedule.length > 0 ? user.schedule : []);
      setChannels([]);
      setNotifications([]);
      setSelectedChannelId('');
      try {
        localStorage.removeItem('univia_user_deadlines');
        localStorage.removeItem('univia_user_channels');
      } catch {}
    } else {
      setDeadlines(INITIAL_DEADLINES);
      setChannels(() => {
        try {
          const saved = localStorage.getItem('univia_user_channels');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
          }
        } catch {}
        return [];
      });
      setNotifications(INITIAL_NOTIFICATIONS);
      setSelectedChannelId('');
      setSchedule(
        user.schedule && user.schedule.length > 0
          ? user.schedule
          : INITIAL_SCHEDULE
      );
    }
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <LoginPage
        initialMode="signin"
        onLoginSuccess={(user, token) => {
          applyUserData(user, token);
        }}
        onSignUpSuccess={(user, token) => {
          applyUserData(user, token);
        }}
      />
    );
  }

  return (
    <div
      id="univia-app-root"
      className="min-h-screen flex bg-[#F8F6FD] text-[#211B33] font-sans"
    >
      {/* Main Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadMessagesCount={unreadMessagesCount}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
        isGuest={isGuest}
        onOpenAiNova={() => setIsAiNovaOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          onDismissNotification={handleDismissNotification}
          onClearAllNotifications={handleClearAllNotifications}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenStreamParser={() => setIsStreamParserOpen(true)}
          onOpenAiNova={() => setIsAiNovaOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          themeMode={themeMode}
          onToggleTheme={setThemeMode}
          onPromptLogin={() => setShowAuthModal(true)}
        />

        {/* Dynamic Main View - full screen for WhatsApp messages without scrollbars or clipping */}
        <main
          className={`flex-1 min-h-0 w-full ${
            activeTab === 'messages'
              ? 'overflow-hidden p-0'
              : 'overflow-y-auto pb-20 md:pb-12'
          }`}
        >
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar - hidden on messages tab to allow WhatsApp full screen typing */}
      {activeTab !== 'messages' && (
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unreadMessagesCount={unreadMessagesCount}
          onOpenStreamParser={() => setIsStreamParserOpen(true)}
        />
      )}

      {/* Modals */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onToggleRsvp={handleToggleRsvp}
        onShareEvent={(evt) => setSharingEvent(evt)}
        onEditEvent={(evt) => setEditingEvent(evt)}
        onOpenRegister={(evt) => setRegisteringEvent(evt)}
      />

      <ShareEventModal
        event={sharingEvent}
        isOpen={Boolean(sharingEvent)}
        onClose={() => setSharingEvent(null)}
      />

      <RegistrationModal
        event={registeringEvent}
        isOpen={Boolean(registeringEvent)}
        onClose={() => setRegisteringEvent(null)}
        onRegisterSubmit={handleRegisterSubmit}
        onCancelRegistration={handleCancelRegistration}
        currentUser={currentUser}
      />

      <EditEventModal
        event={editingEvent}
        isOpen={Boolean(editingEvent)}
        onClose={() => setEditingEvent(null)}
        onSaveEvent={handleEditEvent}
      />

      <OpportunityModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onApply={handleApplyOpportunity}
        onToggleSave={handleToggleOpportunitySave}
      />

      {/* AI Stream Parser Modal */}
      <StreamParserModal
        isOpen={isStreamParserOpen}
        onClose={() => setIsStreamParserOpen(false)}
        schedule={schedule}
        onImportEvent={handleImportStreamEvent}
        onImportOpportunity={handleImportStreamOpportunity}
      />

      {/* AI Nova Campus Intelligence Assistant */}
      <AiNovaModal
        isOpen={isAiNovaOpen}
        onClose={() => setIsAiNovaOpen(false)}
        currentUser={currentUser}
      />

      {/* Guest-to-Full Account Sign In Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-[#E9E1F5]">
            <LoginPage
              initialMode="signin"
              onCancel={() => setShowAuthModal(false)}
              onLoginSuccess={(user, token) => {
                applyUserData(user, token);
                setShowAuthModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
