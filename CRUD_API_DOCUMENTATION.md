# Bhargava Clinic Backend API - CRUD Documentation

## Overview

The Bhargava Clinic Backend API now includes full CRUD (Create, Read, Update, Delete) operations for both Contact and Appointment management, with MongoDB database integration.

## Database Models

### Contact Model
```typescript
{
  name: string;           // Required, 2-100 chars
  email: string;          // Required, valid email
  subject: string;        // Required, 5-200 chars
  message: string;        // Required, 10-2000 chars
  status: 'new' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high';
  tags: string[];         // Optional tags
  assignedTo?: string;    // Optional staff assignment
  repliedAt?: Date;       // Auto-set when status = 'replied'
  archivedAt?: Date;      // Auto-set when status = 'archived'
  createdAt: Date;        // Auto-generated
  updatedAt: Date;         // Auto-generated
}
```

### Appointment Model
```typescript
{
  name: string;                    // Required, 2-100 chars
  email: string;                   // Required, valid email
  phone: string;                   // Required, valid phone
  treatmentType: string;           // Required, from predefined list
  preferredDate: Date;             // Required, not in past
  preferredTime: string;           // Required, from predefined slots
  message?: string;                // Optional, max 1000 chars
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  priority: 'low' | 'medium' | 'high';
  confirmedDate?: Date;            // Set when confirmed
  confirmedTime?: string;          // Set when confirmed
  actualDate?: Date;               // Set when completed
  actualTime?: string;             // Set when completed
  duration: number;               // Default 60 minutes
  notes?: string;                  // Optional staff notes
  assignedTo?: string;             // Optional staff assignment
  tags: string[];                  // Optional tags
  reminderSent: boolean;           // Default false
  reminderSentAt?: Date;           // When reminder sent
  cancelledAt?: Date;              // Auto-set when cancelled
  cancelledReason?: string;        // Optional cancellation reason
  createdAt: Date;                 // Auto-generated
  updatedAt: Date;                 // Auto-generated
}
```

## API Endpoints

### Contact CRUD Operations

#### 1. Create Contact (Public Form)
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry about treatments",
  "message": "I would like to know more about your acne treatment options."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you soon.",
  "data": {
    "id": "64f8b2c1a2b3c4d5e6f7g8h9",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry about treatments",
    "status": "new",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get All Contacts (with Pagination & Filtering)
```http
GET /api/contact?page=1&limit=10&status=new&priority=high&search=john
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `search` (optional): Search in name, email, subject, message

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### 3. Get Single Contact
```http
GET /api/contact/:id
```

#### 4. Update Contact
```http
PUT /api/contact/:id
Content-Type: application/json

{
  "status": "read",
  "priority": "high",
  "tags": ["urgent", "follow-up"],
  "assignedTo": "Dr. Smith"
}
```

#### 5. Delete Contact
```http
DELETE /api/contact/:id
```

#### 6. Get Contact Statistics
```http
GET /api/contact/stats/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "new": 25,
    "read": 45,
    "replied": 60,
    "archived": 20,
    "highPriority": 15,
    "mediumPriority": 100,
    "lowPriority": 35
  }
}
```

### Appointment CRUD Operations

#### 1. Create Appointment (Public Booking)
```http
POST /api/appointment
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1 (555) 123-4567",
  "treatmentType": "Acne Treatment",
  "preferredDate": "2024-01-20",
  "preferredTime": "10:00 AM",
  "message": "I have sensitive skin and would like to discuss options."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment request submitted successfully! We will contact you within 24 hours to confirm.",
  "data": {
    "id": "64f8b2c1a2b3c4d5e6f7g8h9",
    "referenceId": "APT-12345678",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "treatmentType": "Acne Treatment",
    "preferredDate": "2024-01-20T00:00:00.000Z",
    "preferredTime": "10:00 AM",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get All Appointments (with Pagination & Filtering)
```http
GET /api/appointment?page=1&limit=10&status=pending&treatmentType=Acne Treatment&dateFrom=2024-01-01&dateTo=2024-01-31
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `treatmentType` (optional): Filter by treatment type
- `search` (optional): Search in name, email, phone, treatmentType
- `dateFrom` (optional): Filter appointments from date
- `dateTo` (optional): Filter appointments to date

#### 3. Get Single Appointment
```http
GET /api/appointment/:id
```

#### 4. Update Appointment
```http
PUT /api/appointment/:id
Content-Type: application/json

{
  "status": "confirmed",
  "priority": "high",
  "confirmedDate": "2024-01-20",
  "confirmedTime": "10:00 AM",
  "duration": 90,
  "notes": "Patient has sensitive skin",
  "assignedTo": "Dr. Johnson"
}
```

#### 5. Delete Appointment
```http
DELETE /api/appointment/:id
```

#### 6. Confirm Appointment
```http
POST /api/appointment/:id/confirm
Content-Type: application/json

{
  "confirmedDate": "2024-01-20",
  "confirmedTime": "10:00 AM",
  "notes": "Confirmed appointment"
}
```

**Note:** This endpoint automatically:
- Sets status to 'confirmed'
- Sends confirmation email to patient
- Sets confirmedDate and confirmedTime

#### 7. Get Appointment Statistics
```http
GET /api/appointment/stats/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 200,
    "pending": 45,
    "confirmed": 120,
    "cancelled": 15,
    "completed": 18,
    "noShow": 2,
    "highPriority": 25,
    "mediumPriority": 150,
    "lowPriority": 25
  }
}
```

#### 8. Get Available Treatments
```http
GET /api/appointment/treatments
```

**Response:**
```json
{
  "success": true,
  "data": {
    "treatments": [
      "Acne Treatment",
      "Anti-Aging Treatment",
      "Chemical Peels",
      "Pigmentation Treatment",
      "Hair Transplant",
      "PRP Hair Therapy",
      "Hair Loss Treatment",
      "Scalp Treatment",
      "Laser Hair Removal",
      "Laser Skin Resurfacing",
      "Laser Tattoo Removal",
      "Laser Pigmentation Removal",
      "General Consultation"
    ],
    "timeSlots": [
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM"
    ]
  }
}
```

## Database Setup

### MongoDB Installation

**Local MongoDB:**
```bash
# Install MongoDB Community Edition
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Start MongoDB service
mongod
```

**MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/atlas
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Environment Configuration

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/doctor-derma-clinic
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/doctor-derma-clinic

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Other settings...
```

## Features

### Database Features
- **MongoDB Integration**: Full MongoDB database with Mongoose ODM
- **Data Validation**: Comprehensive validation at model and API levels
- **Indexes**: Optimized database indexes for better performance
- **Virtual Fields**: Computed fields like formatted dates and reference IDs
- **Pre-save Hooks**: Automatic field updates based on status changes

### API Features
- **Full CRUD**: Complete Create, Read, Update, Delete operations
- **Pagination**: Efficient pagination for large datasets
- **Filtering**: Multiple filter options (status, priority, dates, search)
- **Search**: Text search across relevant fields
- **Statistics**: Aggregated statistics for dashboard views
- **Email Integration**: Automatic email notifications
- **Error Handling**: Comprehensive error handling and validation

### Security Features
- **Input Validation**: All inputs validated and sanitized
- **Rate Limiting**: Protection against abuse
- **CORS**: Configured for frontend communication
- **Error Handling**: No sensitive information leaked

## Usage Examples

### Frontend Integration

```javascript
// Get all contacts with pagination
const response = await fetch('http://localhost:5000/api/contact?page=1&limit=10&status=new');
const data = await response.json();

// Update contact status
await fetch(`http://localhost:5000/api/contact/${contactId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'read', priority: 'high' })
});

// Get appointment statistics
const statsResponse = await fetch('http://localhost:5000/api/appointment/stats/summary');
const stats = await statsResponse.json();
```

### Admin Dashboard Features
- View all contacts and appointments
- Filter by status, priority, date ranges
- Search across all fields
- Update status and assign to staff
- View statistics and analytics
- Confirm appointments with email notifications

This CRUD system provides a complete backend solution for managing clinic contacts and appointments with professional email notifications and comprehensive data management capabilities.
