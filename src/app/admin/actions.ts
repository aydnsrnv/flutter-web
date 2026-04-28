"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: row } = await supabase
    .from("users")
    .select("admin")
    .eq("user_id", user.id)
    .single();

  if (!row?.admin) throw new Error("Forbidden");
  return supabase;
}

// ─── Dashboard Stats ───
export async function getDashboardStats() {
  const supabase = await assertAdmin();

  const [
    { count: usersCount },
    { count: jobsCount },
    { count: resumesCount },
    { count: companiesCount },
    { count: categoriesCount },
    { count: reportsCount },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("resumes").select("*", { count: "exact", head: true }),
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }),
  ]);

  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("id, title, create_time")
    .order("create_time", { ascending: false })
    .limit(5);

  const { data: recentResumes } = await supabase
    .from("resumes")
    .select("id, full_name, create_time")
    .order("create_time", { ascending: false })
    .limit(5);

  return {
    counts: {
      users: usersCount ?? 0,
      jobs: jobsCount ?? 0,
      resumes: resumesCount ?? 0,
      companies: companiesCount ?? 0,
      categories: categoriesCount ?? 0,
      reports: reportsCount ?? 0,
    },
    recentJobs: recentJobs ?? [],
    recentResumes: recentResumes ?? [],
  };
}

// ─── Users ───
export async function getUsers({
  page = 1,
  limit = 20,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const supabase = await assertAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { data: data ?? [], total: count ?? 0 };
}

export async function updateUserBlock(userId: string, isBlocked: boolean) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("users")
    .update({ is_blocked: isBlocked })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("users").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
  return { success: true };
}

// ─── Jobs ───
export async function getJobs({
  page = 1,
  limit = 20,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const supabase = await assertAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("jobs")
    .select("*, companies(company_name)", { count: "exact" })
    .order("create_time", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { data: data ?? [], total: count ?? 0 };
}

export async function updateJob(
  id: string,
  payload: {
    title?: string;
    company_id?: string;
    company_name?: string;
    city?: string;
    job_type?: string;
    min_salary?: string;
    max_salary?: string;
    education?: string;
    experience?: string;
    gender?: string;
    mail?: string;
    number?: string;
    request?: string;
    about?: string;
    apply_link?: string;
  }
) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("jobs").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/jobs");
  return { success: true };
}

export async function toggleJobPremium(id: string, makePremium: boolean) {
  const supabase = await assertAdmin();

  if (makePremium) {
    const { data: price } = await supabase
      .from("price")
      .select("premium_day_job")
      .order("id", { ascending: true })
      .limit(1)
      .single();

    const days = price?.premium_day_job ?? 30;
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + Number(days));

    const { error } = await supabase
      .from("jobs")
      .update({
        is_premium: true,
        premium_start: now.toISOString(),
        premium_end: end.toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("jobs")
      .update({ is_premium: false, premium_start: null, premium_end: null })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/jobs");
  return { success: true };
}

export async function deleteJob(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/jobs");
  return { success: true };
}

// ─── Resumes ───
export async function getResumes({
  page = 1,
  limit = 20,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const supabase = await assertAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("resumes")
    .select("*", { count: "exact" })
    .order("create_time", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,desired_position.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { data: data ?? [], total: count ?? 0 };
}

export async function updateResume(
  id: string,
  payload: {
    full_name?: string;
    desired_position?: string;
    desired_salary?: string;
    city?: string;
    education_key?: string;
    experience_key?: string;
    skills?: string;
    languages?: string;
    about?: string;
    gender_key?: string;
    marital_status?: string;
    email?: string;
    phone?: string;
    birth_year?: number;
    experiences?: unknown;
    educations?: unknown;
    certifications?: unknown;
  }
) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("resumes").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resumes");
  return { success: true };
}

export async function toggleResumePremium(id: string, makePremium: boolean) {
  const supabase = await assertAdmin();

  if (makePremium) {
    const { data: price } = await supabase
      .from("price")
      .select("premium_day_resume")
      .order("id", { ascending: true })
      .limit(1)
      .single();

    const days = price?.premium_day_resume ?? 30;
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + Number(days));

    const { error } = await supabase
      .from("resumes")
      .update({
        is_premium: true,
        premium_start: now.toISOString(),
        premium_end: end.toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("resumes")
      .update({ is_premium: false, premium_start: null, premium_end: null })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/resumes");
  return { success: true };
}

export async function deleteResume(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("resumes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resumes");
  return { success: true };
}

// ─── Companies ───
export async function getAllCompanies() {
  const supabase = await assertAdmin();
  const { data, error } = await supabase
    .from("companies")
    .select("id, company_name, company_logo")
    .order("company_name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCompanies({
  page = 1,
  limit = 20,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const supabase = await assertAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("companies")
    .select("*", { count: "exact" })
    .order("company_name", { ascending: true })
    .range(from, to);

  if (search) {
    query = query.ilike("company_name", `%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { data: data ?? [], total: count ?? 0 };
}

export async function createCompany(payload: {
  company_name: string;
  company_logo?: string;
  about?: string;
}) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("companies").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/companies");
  return { success: true };
}

export async function updateCompany(
  id: string,
  payload: {
    company_name?: string;
    company_logo?: string;
    about?: string;
  }
) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("companies").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/companies");
  return { success: true };
}

export async function deleteCompany(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/companies");
  return { success: true };
}

// ─── Categories ───
export async function getCategories({
  page = 1,
  limit = 20,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const supabase = await assertAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("display_name", { ascending: true })
    .range(from, to);

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,category_name.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { data: data ?? [], total: count ?? 0 };
}

export async function createCategory(payload: {
  category_name: string;
  display_name: string;
  list_id?: number;
}) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("categories").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(
  id: string,
  payload: {
    category_name?: string;
    display_name?: string;
    list_id?: number;
    job_count?: number;
  }
) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("categories").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  return { success: true };
}

// ─── Reports ───
export async function getReports({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}) {
  const supabase = await assertAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("reports")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data ?? [], total: count ?? 0 };
}

export async function deleteReport(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("reports").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reports");
  return { success: true };
}

// ─── Payments ───
export async function getPayments({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}) {
  const supabase = await assertAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("payments")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data ?? [], total: count ?? 0 };
}

// ─── Notifications ───
export async function getNotifications({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}) {
  const supabase = await assertAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data ?? [], total: count ?? 0 };
}

export async function createNotification(payload: {
  user_id?: string;
  title: string;
  type?: string;
  number?: string;
}) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("notifications").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function deleteNotification(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/notifications");
  return { success: true };
}

// ─── Slider ───
export async function getSliderItems() {
  const supabase = await assertAdmin();
  const { data, error } = await supabase
    .from("slider")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return { data: data ?? [] };
}

export async function createSliderItem(payload: {
  photo_url: string;
  url?: string;
  about?: string;
  type?: string;
}) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("slider").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/slider");
  return { success: true };
}

export async function updateSliderItem(
  id: number,
  payload: {
    photo_url?: string;
    url?: string;
    about?: string;
    type?: string;
  }
) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("slider").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/slider");
  return { success: true };
}

export async function deleteSliderItem(id: number) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("slider").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/slider");
  return { success: true };
}

// ─── Maintenance ───
export async function getMaintenanceStatus() {
  const supabase = await assertAdmin();
  const { data, error } = await supabase
    .from("maintenance")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data ?? null;
}

export async function toggleMaintenance(isOn: boolean) {
  const supabase = await assertAdmin();
  const { data: existing } = await supabase
    .from("maintenance")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("maintenance")
      .update({ is_on: isOn })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("maintenance").insert({ is_on: isOn });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/maintenance");
  return { success: true };
}

// ─── Company Requests ───
export async function getCompanyRequests({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}) {
  const supabase = await assertAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("request_company")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data ?? [], total: count ?? 0 };
}

export async function deleteCompanyRequest(id: number) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("request_company").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/company-requests");
  return { success: true };
}

// ─── Price Settings ───
export async function getPriceSettings() {
  const supabase = await assertAdmin();
  const { data, error } = await supabase
    .from("price")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data ?? null;
}

export async function updatePriceSettings(
  id: number,
  payload: {
    price_job?: number;
    price_premium_job?: number;
    premium_day_job?: number;
    normal_day_job?: number;
    price_resume?: number;
    price_premium_resume?: number;
    premium_day_resume?: number;
    normal_day_resume?: number;
  }
) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("price").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  return { success: true };
}
