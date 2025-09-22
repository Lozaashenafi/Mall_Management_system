import api from "../util/axios";

// ✅ Get all tenants
export const getTenants = async () => {
  try {
    const res = await api.get("/tenants");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch tenants" };
  }
};

// ✅ Get single tenant by ID
export const getTenantById = async (id) => {
  try {
    const res = await api.get(`/tenants/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch tenant" };
  }
};

// ✅ Add new tenant (with file upload)
export const addTenant = async (formData) => {
  try {
    const res = await api.post("/tenants", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to add tenant" };
  }
};

// ✅ Update tenant
export const updateTenant = async (id, formData) => {
  try {
    const res = await api.put(`/tenants/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update tenant" };
  }
};

// ✅ Delete tenant
export const deleteTenant = async (id) => {
  try {
    const res = await api.delete(`/tenants/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete tenant" };
  }
};
