// frontend/src/services/activityService.ts

export interface Activity {
    id: number;
    title: string;
    type: 'coloring' | 'letter_match' | 'bubble_pop' | 'counting' | 'emotion_match' | 'family_tree' | 'digital_painting' | 'forest_hunt' | 'puzzle' | 'maze';
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    image_path?: string;
    image_url?: string; // This will be the direct URL from the server
    colors?: string[]; // The backend will now ensure this is an array
    data?: any;
    status: 'active' | 'inactive' | 'deleted';
    created_at: string;
    updated_at: string;
    // Hierarchy fields
    grade_id?: number;
    book_id?: number;
    unit_id?: number;
    lesson_id?: number;
    grade_name?: string;
    book_title?: string;
    unit_title?: string;
    lesson_title?: string;
    // Educational fields
    learning_objectives?: string;
    prerequisites?: string;
    estimated_duration?: number;
    is_adaptive?: boolean;
    adaptive_rules?: any;
  }
  

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const API_ENDPOINT = `${API_BASE_URL}/api/activities`;
  
  class ActivityService {
    // Helper to construct full image URLs if needed
    private getFullImageUrl(urlPath: string | undefined): string | undefined {
      if (!urlPath) return undefined;
      // If it's already a full URL, return it
      if (urlPath.startsWith('http')) {
          return urlPath;
      }
      // Otherwise, prepend the base API URL
      return `${API_BASE_URL}${urlPath}`;
    }
  
    private processActivity(activity: any): Activity {
      // The backend now sends cleaner data, so processing is simpler.
      // We just need to construct the full image URL.
      return {
        ...activity,
        image_url: this.getFullImageUrl(activity.image_url)
      };
    }
  
    // Get all activities by type
    async getActivitiesByType(type: string): Promise<Activity[]> {
      try {
        // Use query parameters for better RESTful design
        const response = await fetch(`${API_ENDPOINT}?type=${type}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.statusText}`);
        }
        const data = await response.json();
        return Array.isArray(data) 
          ? data.map(act => this.processActivity(act))
          : [];
      } catch (error) {
        console.error('Error fetching activities by type:', error);
        return [];
      }
    }
  
    // Get all activities
    async getAllActivities(): Promise<Activity[]> {
      try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.statusText}`);
        }
        const data = await response.json();
        return Array.isArray(data) 
          ? data.map(act => this.processActivity(act))
          : [];
      } catch (error) {
        console.error('Error fetching all activities:', error);
        return [];
      }
    }
  
    // Get single activity by ID
    async getActivityById(id: number): Promise<Activity | null> {
      try {
        const response = await fetch(`${API_ENDPOINT}/${id}`);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error(`Failed to fetch activity: ${response.statusText}`);
        }
        const data = await response.json();
        return this.processActivity(data);
      } catch (error) {
        console.error('Error fetching activity by ID:', error);
        return null;
      }
    }
  
    // Create new activity (for admin)
    async createActivity(activityData: FormData): Promise<{ success: boolean; activityId?: number; error?: string }> {
      try {
        // For FormData, we need to use fetch directly instead of axios
        // because axios doesn't handle FormData properly by default
        const response = await fetch(`${API_ENDPOINT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: activityData,
        });
  
        const result = await response.json();
        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to create activity' };
        }
        return { success: true, activityId: result.activityId };
      } catch (error) {
        console.error('Error creating activity:', error);
        return { success: false, error: 'A network error occurred.' };
      }
    }
  
    // Update activity (for admin)
    async updateActivity(id: number, activityData: FormData): Promise<{ success: boolean; error?: string }> {
      try {
        const response = await fetch(`${API_ENDPOINT}/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: activityData,
        });
  
        const result = await response.json();
        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to update activity' };
        }
        return { success: true };
      } catch (error) {
        console.error('Error updating activity:', error);
        return { success: false, error: 'A network error occurred.' };
      }
    }
    
    // Delete activity is fine, but let's make it consistent
    async deleteActivity(id: number): Promise<{ success: boolean; error?: string }> {
      try {
        const response = await fetch(`${API_ENDPOINT}/${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to delete activity' };
        }
        return { success: true };
      } catch (error) {
          console.error('Error deleting activity:', error);
          return { success: false, error: 'A network error occurred.' };
      }
    }

  // Get random activity by type (for variety in games)
  async getRandomActivityByType(type: string): Promise<Activity | null> {
    try {
      const activities = await this.getActivitiesByType(type);
      if (activities.length === 0) {
        // Return a default activity if none found
        return {
          id: 0,
          title: 'Colorful Fun',
          type: type as any,
          description: 'Have fun coloring!',
          difficulty: 'easy',
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      const randomIndex = Math.floor(Math.random() * activities.length);
      return activities[randomIndex];
    } catch (error) {
      console.error('Error getting random activity:', error);
      return null;
    }
  }

  // Helper method to build full image URL
  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }

  // Get activities by hierarchy
  async getActivitiesByHierarchy(
    gradeId?: number,
    bookId?: number,
    unitId?: number,
    lessonId?: number,
    type?: string
  ): Promise<Activity[]> {
    try {
      let url = `${API_ENDPOINT}/hierarchy`;
      if (gradeId) url += `/${gradeId}`;
      if (bookId) url += `/${bookId}`;
      if (unitId) url += `/${unitId}`;
      if (lessonId) url += `/${lessonId}`;
      if (type) url += `?type=${type}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch activities by hierarchy: ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) 
        ? data.map(act => this.processActivity(act))
        : [];
    } catch (error) {
      console.error('Error fetching activities by hierarchy:', error);
      return [];
    }
  }

  // Get activities for teacher
  async getTeacherActivities(teacherId: number, type?: string): Promise<Activity[]> {
    try {
      let url = `${API_ENDPOINT}/teacher/${teacherId}`;
      if (type) url += `?type=${type}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch teacher activities: ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) 
        ? data.map(act => this.processActivity(act))
        : [];
    } catch (error) {
      console.error('Error fetching teacher activities:', error);
      return [];
    }
  }
}

export const activityService = new ActivityService();
export default activityService;