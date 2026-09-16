import { UserProfile } from '../types';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('univia_session_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface StudentApiResponse<T> {
  success: boolean;
  message?: string;
  source?: string;
  error?: string;
  student?: T;
  students?: T[];
  count?: number;
}

/**
 * Fetch a student's profile from MongoDB backend
 * Supports MongoDB ID, Roll ID (campusCardId / studentId), or Email
 */
export async function getStudent(idOrRollOrEmail: string): Promise<UserProfile> {
  const cleanId = encodeURIComponent(idOrRollOrEmail.trim());
  const response = await fetch(`/api/students/${cleanId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: StudentApiResponse<UserProfile> = await response.json();

  if (!response.ok || !data.success || !data.student) {
    throw new Error(data.error || `Failed to fetch student with identifier ${idOrRollOrEmail}`);
  }

  return data.student;
}

/**
 * Create a new student profile in MongoDB
 */
export async function createStudent(profileData: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch('/api/students', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  const data: StudentApiResponse<UserProfile> = await response.json();

  if (!response.ok || !data.success || !data.student) {
    throw new Error(data.error || 'Failed to create student profile in database.');
  }

  return data.student;
}

/**
 * Update an existing student profile in MongoDB
 */
export async function updateStudent(
  idOrRollOrEmail: string,
  updatedFields: Partial<UserProfile>
): Promise<UserProfile> {
  const cleanId = encodeURIComponent(idOrRollOrEmail.trim());
  const response = await fetch(`/api/students/${cleanId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedFields),
  });

  const data: StudentApiResponse<UserProfile> = await response.json();

  if (!response.ok || !data.success || !data.student) {
    throw new Error(data.error || `Failed to update student profile ${idOrRollOrEmail}`);
  }

  return data.student;
}

/**
 * Delete a student profile from MongoDB
 */
export async function deleteStudent(idOrRollOrEmail: string): Promise<boolean> {
  const cleanId = encodeURIComponent(idOrRollOrEmail.trim());
  const response = await fetch(`/api/students/${cleanId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data: StudentApiResponse<UserProfile> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Failed to delete student profile ${idOrRollOrEmail}`);
  }

  return true;
}

/**
 * Retrieve all students from MongoDB with optional search query
 */
export async function getAllStudents(params?: {
  q?: string;
  department?: string;
  classYear?: string;
}): Promise<UserProfile[]> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.department) searchParams.set('department', params.department);
  if (params?.classYear) searchParams.set('classYear', params.classYear);

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const response = await fetch(`/api/students${queryStr}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data: StudentApiResponse<UserProfile> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to retrieve students from database');
  }

  return data.students || [];
}
