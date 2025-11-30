// src/api/overdue/overdue.controller.js - FIXED IMPORT
import {
  cacheInvoicesAndDueDates,
  getOverdueTenants,
  getMostOverdueTenants,
  getFrequentOverdueTenants,
  getOverdueStats,
  getOverdueInvoices,
} from "../../services/OverdueCacheService.js";

export const runCacheUpdate = async (req, res) => {
  try {
    const result = await cacheInvoicesAndDueDates();
    res.json({
      success: true,
      message: "Cache update completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in runCacheUpdate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cache",
      error: error.message,
    });
  }
};

export const getAllOverdueTenants = async (req, res) => {
  try {
    const tenants = await getOverdueTenants();
    res.json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error("Error in getAllOverdueTenants:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overdue tenants",
      error: error.message,
    });
  }
};

export const getMostOverdue = async (req, res) => {
  try {
    const tenants = await getMostOverdueTenants();
    res.json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error("Error in getMostOverdue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch most overdue tenants",
      error: error.message,
    });
  }
};

export const getFrequentOverdue = async (req, res) => {
  try {
    const tenants = await getFrequentOverdueTenants();
    res.json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error("Error in getFrequentOverdue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch frequent overdue tenants",
      error: error.message,
    });
  }
};

export const getOverdueStatistics = async (req, res) => {
  try {
    const stats = await getOverdueStats();
    console.log("Sending stats response:", stats);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in getOverdueStatistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overdue statistics",
      error: error.message,
    });
  }
};

export const getAllOverdueInvoices = async (req, res) => {
  try {
    const invoices = await getOverdueInvoices();
    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Error in getAllOverdueInvoices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overdue invoices",
      error: error.message,
    });
  }
};
