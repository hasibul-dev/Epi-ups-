import React, { createContext, useContext, useState, useEffect } from 'react';
import { marketingStore } from '../services/marketingStorage.js';
import { useAuth } from '../../../context/AuthContext.jsx';

const MarketingContext = createContext(null);

export function MarketingProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(() => marketingStore.getSnapshot());

  // Modal states
  const [campaignModal, setCampaignModal] = useState({ open: false, item: null });
  const [postModal, setPostModal] = useState({ open: false, item: null });
  const [adModal, setAdModal] = useState({ open: false, item: null });
  const [assetModal, setAssetModal] = useState({ open: false, item: null });
  const [creativeModal, setCreativeModal] = useState({ open: false, item: null });
  const [taskModal, setTaskModal] = useState({ open: false, item: null });
  const [ticketModal, setTicketModal] = useState({ open: false, item: null });
  const [deviceModal, setDeviceModal] = useState({ open: false, item: null });
  const [ticketDetails, setTicketDetails] = useState({ open: false, item: null });

  // Subscribe to persistent storage events
  useEffect(() => {
    const unsubscribe = marketingStore.subscribe((snapshot) => {
      setData({ ...snapshot });
    });
    return () => unsubscribe();
  }, []);

  // Role permissions
  const role = user?.role || 'employee';
  const isSuperAdmin = role === 'superadmin' || user?.departments?.includes('admin');
  
  const isMarketingManager = isSuperAdmin || role === 'marketing_manager' || role === 'manager';
  const isMarketingExecutive = isMarketingManager || role === 'marketing_executive';
  const isMarketingRole = isMarketingExecutive;

  const isItManager = isSuperAdmin || role === 'it_manager';
  const isItTechnician = isItManager || role === 'it_technician' || role === 'engineer';
  const isItRole = isItTechnician;

  // Modal open/close helpers
  const openCampaignModal = (item = null) => setCampaignModal({ open: true, item });
  const closeCampaignModal = () => setCampaignModal({ open: false, item: null });

  const openPostModal = (item = null) => setPostModal({ open: true, item });
  const closePostModal = () => setPostModal({ open: false, item: null });

  const openAdModal = (item = null) => setAdModal({ open: true, item });
  const closeAdModal = () => setAdModal({ open: false, item: null });

  const openAssetModal = (item = null) => setAssetModal({ open: true, item });
  const closeAssetModal = () => setAssetModal({ open: false, item: null });

  const openCreativeModal = (item = null) => setCreativeModal({ open: true, item });
  const closeCreativeModal = () => setCreativeModal({ open: false, item: null });

  const openTaskModal = (item = null) => setTaskModal({ open: true, item });
  const closeTaskModal = () => setTaskModal({ open: false, item: null });

  const openTicketModal = (item = null) => setTicketModal({ open: true, item });
  const closeTicketModal = () => setTicketModal({ open: false, item: null });

  const openDeviceModal = (item = null) => setDeviceModal({ open: true, item });
  const closeDeviceModal = () => setDeviceModal({ open: false, item: null });

  const openTicketDetails = (item) => setTicketDetails({ open: true, item });
  const closeTicketDetails = () => setTicketDetails({ open: false, item: null });

  // CRUD actions
  const saveCampaign = (c) => marketingStore.saveCampaign(c);
  const deleteCampaign = (id) => marketingStore.deleteCampaign(id);

  const savePost = (p) => marketingStore.savePost(p);
  const deletePost = (id) => marketingStore.deletePost(id);

  const saveAd = (a) => marketingStore.saveAd(a);
  const deleteAd = (id) => marketingStore.deleteAd(id);

  const saveAsset = (a) => marketingStore.saveAsset(a);
  const deleteAsset = (id) => marketingStore.deleteAsset(id);

  const saveCreativeRequest = (r) => marketingStore.saveCreativeRequest(r);
  const deleteCreativeRequest = (id) => marketingStore.deleteCreativeRequest(id);

  const saveTask = (t) => marketingStore.saveTask(t, user);
  const deleteTask = (id) => marketingStore.deleteTask(id);

  // Notifications
  const notifications = data.notifications || [];
  const unreadNotificationsCount = notifications.filter(
    (n) => !n.read && (!user?.name || n.recipient === user?.name || isSuperAdmin || isMarketingManager)
  ).length;

  const markNotificationAsRead = (id) => marketingStore.markNotificationAsRead(id);
  const markAllNotificationsAsRead = (recipient) =>
    marketingStore.markAllNotificationsAsRead(recipient || (isSuperAdmin ? null : user?.name));
  const deleteNotification = (id) => marketingStore.deleteNotification(id);
  const clearAllNotifications = (recipient) =>
    marketingStore.clearAllNotifications(recipient || (isSuperAdmin ? null : user?.name));

  const saveTicket = (t) => marketingStore.saveTicket(t);
  const deleteTicket = (id) => marketingStore.deleteTicket(id);

  const resolveTicket = (id, resolutionDetails) => {
    const existing = data.tickets.find((t) => t.id === id);
    if (!existing) return;
    marketingStore.saveTicket({
      ...existing,
      status: 'Resolved',
      resolutionDetails: resolutionDetails || existing.resolutionDetails || 'Resolved by IT Support Engineer',
    });
  };

  const saveDevice = (d) => marketingStore.saveDevice(d);
  const deleteDevice = (id) => marketingStore.deleteDevice(id);

  const saveSoftware = (s) => marketingStore.saveSoftware(s);
  const deleteSoftware = (id) => marketingStore.deleteSoftware(id);

  const saveMaintenance = (m) => marketingStore.saveMaintenance(m);
  const deleteMaintenance = (id) => marketingStore.deleteMaintenance(id);

  const updateSettings = (s) => marketingStore.updateSettings(s);
  const exportBackup = () => marketingStore.exportBackup();
  const importBackup = (content) => marketingStore.importBackup(content);
  const resetDemo = () => marketingStore.resetDemo();

  return (
    <MarketingContext.Provider
      value={{
        data,
        user,
        role,
        isSuperAdmin,
        isMarketingManager,
        isMarketingExecutive,
        isMarketingRole,
        isItManager,
        isItTechnician,
        isItRole,

        // Modals
        campaignModal,
        openCampaignModal,
        closeCampaignModal,

        postModal,
        openPostModal,
        closePostModal,

        adModal,
        openAdModal,
        closeAdModal,

        assetModal,
        openAssetModal,
        closeAssetModal,

        creativeModal,
        openCreativeModal,
        closeCreativeModal,

        taskModal,
        openTaskModal,
        closeTaskModal,

        ticketModal,
        openTicketModal,
        closeTicketModal,

        deviceModal,
        openDeviceModal,
        closeDeviceModal,

        ticketDetails,
        openTicketDetails,
        closeTicketDetails,

        // Actions
        saveCampaign,
        deleteCampaign,
        savePost,
        deletePost,
        saveAd,
        deleteAd,
        saveAsset,
        deleteAsset,
        saveCreativeRequest,
        deleteCreativeRequest,
        saveTask,
        deleteTask,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        saveTicket,
        deleteTicket,
        resolveTicket,
        saveDevice,
        deleteDevice,
        saveSoftware,
        deleteSoftware,
        saveMaintenance,
        deleteMaintenance,
        updateSettings,
        exportBackup,
        importBackup,
        resetDemo,
      }}
    >
      {children}
    </MarketingContext.Provider>
  );
}

export function useMarketing() {
  const ctx = useContext(MarketingContext);
  if (!ctx) {
    throw new Error('useMarketing must be used within a MarketingProvider');
  }
  return ctx;
}
