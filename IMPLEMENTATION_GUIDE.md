# Parent-Child Multi-Tenancy Implementation Guide

## Overview

This guide implements a multi-tenancy system where:
- **Admin** creates **Parent** accounts
- **Parents** create **Child** profiles
- **Children** login with their own credentials to access their dashboard

## Database Changes Required

### 1. Run the Schema Updates

Execute the SQL file: `database/schema_updates.sql`

```sql
-- Key changes:
1. Add 'parent' role to users table
2. Create 'children' table for parent-child relationship  
3. Create 'child_progress' table for tracking progress
4. Create 'child_badges' and 'child_streaks' tables
5. Update existing parent user role
```

## Backend Implementation

### 1. New Files Created

- `backend/controllers/childController.js` - Handles child CRUD operations
- `backend/routes/childRoutes.js` - Child API routes

### 2. Updated Files

- `backend/routes/userRoutes.js` - Added 'parent' role validation
- `backend/middleware/auth.js` - Added child authentication and parent middleware
- `backend/app.js` - Added child routes

### 3. New API Endpoints

```
POST   /api/children           - Create child (Parent only)
GET    /api/children           - Get parent's children (Parent only)  
POST   /api/children/login     - Child login
PUT    /api/children/:id/progress - Update child progress
DELETE /api/children/:id       - Delete child (Parent only)
```

## Frontend Implementation

### 1. Updated Files

- `project/src/contexts/AuthContext.tsx` - Added parent role support and child creation
- `project/src/services/api.ts` - Added child-related API functions
- `project/src/App.tsx` - Added parent routes and navigation

### 2. New Routes Added

```
/parent/dashboard     - Parent dashboard
/parent/children      - View children list
/parent/create-child  - Create new child profile
```

## New User Workflow

### 1. Admin Workflow
1. Admin logs in to admin dashboard
2. Admin creates Parent accounts with role='parent'

### 2. Parent Workflow  
1. Parent logs in with their credentials
2. Parent navigates to `/parent/dashboard`
3. Parent can create child profiles with:
   - First Name
   - Username (unique)
   - Email (unique)
   - Password
   - Age (3-12)
   - Gender (boy/girl)
   - Avatar (optional)

### 3. Child Workflow
1. Child logs in with their own email/password
2. Child gets JWT token with `isChild: true` flag
3. Child navigates to `/student/letter-path`
4. Child's progress is tracked separately in database

## Authentication Flow

### Parent Authentication
- Uses existing user login endpoint
- Role: 'parent'
- Can create/manage children
- Access to parent dashboard

### Child Authentication  
- Uses new `/api/children/login` endpoint
- JWT token includes `isChild: true` and `parentId`
- Role appears as 'student' but tracked as child
- Progress stored in `child_progress` table

## Database Relationships

```
users (parents)
├── children (1:many)
    ├── child_progress (1:many)
    ├── child_badges (1:many)  
    └── child_streaks (1:1)
```

## Key Features

### Multi-tenancy
- Each parent manages their own children
- Children data is isolated per parent
- Secure access control at database level

### Progress Tracking
- Individual progress tracking per child
- Badge system per child
- Streak tracking per child
- Compatible with existing frontend components

### Security
- JWT tokens distinguish between parents and children
- Role-based access control
- Database foreign key constraints
- Input validation on all endpoints

## Testing Steps

### 1. Database Setup
```sql
-- Run the SQL updates
SOURCE database/schema_updates.sql;
```

### 2. Backend Testing
```bash
# Start backend server
cd backend
npm start

# Test endpoints with Postman/curl
POST /api/users/register (create parent)
POST /api/users/login (parent login)  
POST /api/children (create child)
POST /api/children/login (child login)
```

### 3. Frontend Testing
```bash
# Start frontend
cd project  
npm start

# Test user flows:
1. Admin creates parent account
2. Parent logs in and creates child
3. Child logs in and accesses dashboard
```

## Migration Notes

### Existing Data
- Current student users remain unchanged
- Add `role='parent'` to existing parent users manually
- No data loss for existing functionality

### Backward Compatibility
- Existing student login still works
- Existing progress tracking maintained
- All current features preserved

## Security Considerations

### Authentication
- Separate login endpoints for users vs children
- JWT tokens include role and child flags
- Database queries filtered by parent ownership

### Data Isolation
- Children can only access their own data
- Parents can only manage their own children  
- Admin has full access for management

### Validation
- Strong input validation on all endpoints
- Age restrictions (3-12 years)
- Unique constraints on usernames/emails
- Password complexity requirements

## Next Steps

### Immediate
1. Run database schema updates
2. Test all new endpoints
3. Verify frontend routing
4. Test complete user workflows

### Future Enhancements
1. Bulk child creation
2. Parent-child activity sharing
3. Parental controls and restrictions
4. Child profile pictures upload
5. Progress reports for parents

## Support

For issues with implementation:
1. Check database connections
2. Verify all schema updates applied
3. Check backend logs for errors
4. Test API endpoints individually
5. Verify JWT token structure

This implementation provides a complete multi-tenant system while maintaining backward compatibility with existing functionality.
