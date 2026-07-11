import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Interface Definitions
export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "USER" | "AGENT" | "ADMIN";
  phone?: string;
  createdAt: string;
}

export interface IComplaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  attachmentUrl?: string;
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";
  userId: string;
  agentId?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFeedback {
  _id: string;
  complaintId: string;
  userId: string;
  rating: number; // 1 to 5
  comments: string;
  createdAt: string;
}

// Check MongoDB availability
const MONGODB_URI = process.env.MONGODB_URI || "";
export let isUsingMongoDB = false;

// ----------------------------------------------------
// MONGOOSE SCHEMAS & MODELS
// ----------------------------------------------------
let UserSchema: any;
let ComplaintSchema: any;
let FeedbackSchema: any;

let UserModel: mongoose.Model<any> | null = null;
let ComplaintModel: mongoose.Model<any> | null = null;
let FeedbackModel: mongoose.Model<any> | null = null;

if (MONGODB_URI) {
  try {
    UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: ["USER", "AGENT", "ADMIN"], default: "USER" },
      phone: { type: String },
      createdAt: { type: Date, default: Date.now },
    });

    ComplaintSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      category: { type: String, required: true },
      attachmentUrl: { type: String },
      status: {
        type: String,
        enum: ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED"],
        default: "PENDING",
      },
      userId: { type: String, required: true },
      agentId: { type: String },
      resolutionNotes: { type: String },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    FeedbackSchema = new mongoose.Schema({
      complaintId: { type: String, required: true },
      userId: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comments: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    });

    UserModel = mongoose.model("User", UserSchema);
    ComplaintModel = mongoose.model("Complaint", ComplaintSchema);
    FeedbackModel = mongoose.model("Feedback", FeedbackSchema);
    isUsingMongoDB = true;
  } catch (err) {
    console.error("Mongoose registration error, falling back to JSON:", err);
    isUsingMongoDB = false;
  }
}

// ----------------------------------------------------
// LOCAL JSON DATABASE FALLBACK ENGINE
// ----------------------------------------------------
const DATA_DIR = path.join(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JsonCollection<T extends { _id: string }> {
  private filePath: string;

  constructor(filename: string) {
    this.filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private read(): T[] {
    try {
      const data = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private write(data: T[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  public async find(filter: Partial<T> = {}): Promise<T[]> {
    const list = this.read();
    return list.filter((item: any) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  public async findOne(filter: Partial<T>): Promise<T | null> {
    const list = this.read();
    const found = list.find((item: any) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
    return found || null;
  }

  public async findById(id: string): Promise<T | null> {
    const list = this.read();
    const found = list.find((item) => item._id === id);
    return found || null;
  }

  public async create(doc: Omit<T, "_id"> & { _id?: string }): Promise<T> {
    const list = this.read();
    const newDoc = {
      ...doc,
      _id: doc._id || Math.random().toString(36).substr(2, 9),
    } as T;
    list.push(newDoc);
    this.write(list);
    return newDoc;
  }

  public async findByIdAndUpdate(
    id: string,
    update: Partial<T>
  ): Promise<T | null> {
    const list = this.read();
    const index = list.findIndex((item) => item._id === id);
    if (index === -1) return null;

    const updated = {
      ...list[index],
      ...update,
      updatedAt: new Date().toISOString(),
    } as T;
    list[index] = updated;
    this.write(list);
    return updated;
  }

  public async findByIdAndDelete(id: string): Promise<T | null> {
    const list = this.read();
    const index = list.findIndex((item) => item._id === id);
    if (index === -1) return null;

    const deleted = list[index];
    list.splice(index, 1);
    this.write(list);
    return deleted;
  }
}

const jsonUsers = new JsonCollection<IUser>("users.json");
const jsonComplaints = new JsonCollection<IComplaint>("complaints.json");
const jsonFeedbacks = new JsonCollection<IFeedback>("feedbacks.json");

// Seed default Admin if no users exist
async function seedDefaultData() {
  const adminEmail = "admin@complaints.com";
  let adminExists = false;

  if (isUsingMongoDB && UserModel) {
    adminExists = (await UserModel.findOne({ email: adminEmail })) !== null;
  } else {
    adminExists = (await jsonUsers.findOne({ email: adminEmail })) !== null;
  }

  if (!adminExists) {
    // Hash: "admin123" with default rounds or a preset hash
    // We'll use a precomputed hash for "admin123" to speed up or dynamically hash it in the code when needed.
    // Presaved bcrypt hash for "admin123":
    const defaultHash = "$2a$10$Wb88pYt0YkM6Vw4TCOeS4.KkEbeWJ9Vn7n1uH.9BvD.2i/105Y4W6"; // "admin123"
    const adminUser = {
      name: "System Admin",
      email: adminEmail,
      passwordHash: defaultHash,
      role: "ADMIN" as const,
      phone: "+15551234567",
      createdAt: new Date().toISOString(),
    };

    if (isUsingMongoDB && UserModel) {
      await UserModel.create(adminUser);
    } else {
      await jsonUsers.create(adminUser);
    }
    console.log("Seeded default admin account: admin@complaints.com / admin123");

    // Also seed a default Agent
    const agentEmail = "agent@complaints.com";
    const agentUser = {
      name: "Support Agent Alex",
      email: agentEmail,
      passwordHash: defaultHash,
      role: "AGENT" as const,
      phone: "+15557654321",
      createdAt: new Date().toISOString(),
    };

    if (isUsingMongoDB && UserModel) {
      await UserModel.create(agentUser);
    } else {
      await jsonUsers.create(agentUser);
    }
    console.log("Seeded default agent account: agent@complaints.com / admin123");

    // Seed a sample User too for ease of previewing
    const userEmail = "user@complaints.com";
    const userUser = {
      name: "Jane Doe",
      email: userEmail,
      passwordHash: defaultHash,
      role: "USER" as const,
      phone: "+15559876543",
      createdAt: new Date().toISOString(),
    };

    if (isUsingMongoDB && UserModel) {
      await UserModel.create(userUser);
    } else {
      await jsonUsers.create(userUser);
    }
    console.log("Seeded default user account: user@complaints.com / admin123");
  }
}

// Connect to MongoDB if required
export async function connectDB() {
  if (MONGODB_URI) {
    try {
      mongoose.set("strictQuery", false);
      await mongoose.connect(MONGODB_URI);
      console.log("Successfully connected to MongoDB Atlas!");
      isUsingMongoDB = true;
    } catch (err) {
      console.error("Failed to connect to MongoDB Atlas, running in JSON fallback mode:", err);
      isUsingMongoDB = false;
    }
  } else {
    console.log("No MONGODB_URI env variable set. Running on local persistent JSON database.");
  }
  await seedDefaultData();
}

// Unified Database CRUD Helper API
export const db = {
  users: {
    find: async (filter: any = {}) => {
      if (isUsingMongoDB && UserModel) {
        return await UserModel.find(filter).lean();
      }
      return await jsonUsers.find(filter);
    },
    findOne: async (filter: any) => {
      if (isUsingMongoDB && UserModel) {
        return await UserModel.findOne(filter).lean();
      }
      return await jsonUsers.findOne(filter);
    },
    findById: async (id: string) => {
      if (isUsingMongoDB && UserModel) {
        return await UserModel.findById(id).lean();
      }
      return await jsonUsers.findById(id);
    },
    create: async (data: any) => {
      if (isUsingMongoDB && UserModel) {
        const u = await UserModel.create(data);
        return u.toObject();
      }
      return await jsonUsers.create(data);
    },
    findByIdAndUpdate: async (id: string, update: any) => {
      if (isUsingMongoDB && UserModel) {
        return await UserModel.findByIdAndUpdate(id, update, { new: true }).lean();
      }
      return await jsonUsers.findByIdAndUpdate(id, update);
    },
    findByIdAndDelete: async (id: string) => {
      if (isUsingMongoDB && UserModel) {
        return await UserModel.findByIdAndDelete(id).lean();
      }
      return await jsonUsers.findByIdAndDelete(id);
    },
  },
  complaints: {
    find: async (filter: any = {}) => {
      if (isUsingMongoDB && ComplaintModel) {
        return await ComplaintModel.find(filter).lean();
      }
      return await jsonComplaints.find(filter);
    },
    findOne: async (filter: any) => {
      if (isUsingMongoDB && ComplaintModel) {
        return await ComplaintModel.findOne(filter).lean();
      }
      return await jsonComplaints.findOne(filter);
    },
    findById: async (id: string) => {
      if (isUsingMongoDB && ComplaintModel) {
        return await ComplaintModel.findById(id).lean();
      }
      return await jsonComplaints.findById(id);
    },
    create: async (data: any) => {
      if (isUsingMongoDB && ComplaintModel) {
        const c = await ComplaintModel.create({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return c.toObject();
      }
      const now = new Date().toISOString();
      return await jsonComplaints.create({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    },
    findByIdAndUpdate: async (id: string, update: any) => {
      if (isUsingMongoDB && ComplaintModel) {
        return await ComplaintModel.findByIdAndUpdate(
          id,
          { ...update, updatedAt: new Date() },
          { new: true }
        ).lean();
      }
      return await jsonComplaints.findByIdAndUpdate(id, update);
    },
    findByIdAndDelete: async (id: string) => {
      if (isUsingMongoDB && ComplaintModel) {
        return await ComplaintModel.findByIdAndDelete(id).lean();
      }
      return await jsonComplaints.findByIdAndDelete(id);
    },
  },
  feedbacks: {
    find: async (filter: any = {}) => {
      if (isUsingMongoDB && FeedbackModel) {
        return await FeedbackModel.find(filter).lean();
      }
      return await jsonFeedbacks.find(filter);
    },
    findOne: async (filter: any) => {
      if (isUsingMongoDB && FeedbackModel) {
        return await FeedbackModel.findOne(filter).lean();
      }
      return await jsonFeedbacks.findOne(filter);
    },
    findById: async (id: string) => {
      if (isUsingMongoDB && FeedbackModel) {
        return await FeedbackModel.findById(id).lean();
      }
      return await jsonFeedbacks.findById(id);
    },
    create: async (data: any) => {
      if (isUsingMongoDB && FeedbackModel) {
        const f = await FeedbackModel.create(data);
        return f.toObject();
      }
      return await jsonFeedbacks.create({
        ...data,
        createdAt: new Date().toISOString(),
      });
    },
  },
};
