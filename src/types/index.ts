export type UserRole = "admin" | "company" | "model";

export interface Profile {
  id: string;
  role: UserRole;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  company_code: string;
  color: string;
  is_active: boolean;
  created_at: string;
  login_id?: string;
}

export interface SampleSchedule {
  id: string;
  company_id: string;
  date: string;
  sample_code: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleWithCompany extends SampleSchedule {
  companies: {
    name: string;
    color: string;
    company_code: string;
  };
}

export interface CompanyCreateInput {
  name: string;
  company_code: string;
  login_id: string;
  password: string;
  color?: string;
}

export interface ScheduleFormData {
  date: string;
  sample_code: string;
  content: string;
}

export interface Model {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  created_at: string;
  login_id?: string;
  hourly_rate?: number | null;
}

export interface ModelSchedule {
  id: string;
  model_id: string;
  date: string;
  start_time: string;
  end_time: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModelScheduleWithModel extends ModelSchedule {
  models: {
    name: string;
    color: string;
  };
}
