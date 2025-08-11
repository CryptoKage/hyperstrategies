import UserTab from '../models/userTab.js';

export const createUserTab = async (user_id, tab_id, acquired_at = new Date()) => {
  return await UserTab.create({ user_id, tab_id, acquired_at });
};

export const getUserTab = async (user_id, tab_id) => {
  return await UserTab.findOne({ where: { user_id, tab_id } });
};

export const updateUserTab = async (user_id, tab_id, updates) => {
  const record = await getUserTab(user_id, tab_id);
  if (!record) return null;
  return await record.update(updates);
};

export const deleteUserTab = async (user_id, tab_id) => {
  return await UserTab.destroy({ where: { user_id, tab_id } });
};

export const listUserTabs = async (user_id) => {
  return await UserTab.findAll({ where: { user_id } });
};
