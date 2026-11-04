# Security Specification for WORKSPACE

## Data Invariants
1. A post must have a valid author ID matching the authenticated user.
2. A task must belong to a valid status ('backlog' | 'todo' | 'in_progress' | 'review' | 'done') and priority.
3. Chat messages can only be sent by the authenticated author.
4. Notifications are private to the recipient.
5. Documents have role-level classification ('all', 'manager', 'admin') with Super Admin and Admin rights.

## Role-Based Access Control (RBAC)
- **Super Admin**: Full permissions, system config, user role promotions, audit logs.
- **Admin**: Document management, channel creation, user status, task oversight.
- **Manager**: Team project oversight, action item approvals, schedule management.
- **Employee**: Task updates, feed participation, direct and channel chats, document reading.
