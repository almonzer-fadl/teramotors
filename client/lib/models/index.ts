// Import all models to ensure they are registered with mongoose
import './Appointment';
import './Customer';
import './Estimate';
import './InspectionTemplate';
import './Invoice';
import './JobCard';
import './Mechanic';
import './Part';
import './Service';
import './User';
import './Vehicle';
import './VehicleInspection';

// Re-export all models
export { default as Appointment } from './Appointment';
export { default as Customer } from './Customer';
export { default as Estimate } from './Estimate';
export { default as InspectionTemplate } from './InspectionTemplate';
export { default as Invoice } from './Invoice';
export { default as JobCard } from './JobCard';
export { default as Mechanic } from './Mechanic';
export { default as Part } from './Part';
export { default as Service } from './Service';
export { default as User } from './User';
export { default as Vehicle } from './Vehicle';
export { default as VehicleInspection } from './VehicleInspection';
