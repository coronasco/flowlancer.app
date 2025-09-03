import { z } from "zod";

const SocialLinksSchema = z.object({
    github: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    dribbble: z.string().url().optional().or(z.literal("")),
    behance: z.string().url().optional().or(z.literal("")),
}).optional();

const VisibilitySettingsSchema = z.object({
    bio: z.boolean().optional(),
    skills: z.boolean().optional(),
    experience: z.boolean().optional(),
    socialLinks: z.boolean().optional(),
    hourlyRate: z.boolean().optional(),
    projects: z.boolean().optional(),
    feedback: z.boolean().optional(),
}).optional();

export const ProfileUpdateSchema = z.object({
    name: z.string().trim().min(1).max(80).optional(),
    bio: z.string().trim().max(500).optional(),
    role: z.string().trim().max(80).optional(),
    location: z.string().trim().max(120).optional(),
    skills: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
    experience: z.array(z.string().trim().min(1).max(200)).max(10).optional(),
    socialLinks: SocialLinksSchema,
    isPublic: z.boolean().optional(),
    visibilitySettings: VisibilitySettingsSchema,
});

const RequiredVisibilitySettingsSchema = z.object({
    bio: z.boolean().optional(),
    skills: z.boolean().optional(),
    experience: z.boolean().optional(),
    socialLinks: z.boolean().optional(),
    hourlyRate: z.boolean().optional(),
    projects: z.boolean().optional(),
    feedback: z.boolean().optional(),
});

export const ProfilePublicSettingsSchema = z.object({
    isPublic: z.boolean(),
    visibilitySettings: RequiredVisibilitySettingsSchema,
});

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type ProfilePublicSettings = z.infer<typeof ProfilePublicSettingsSchema>;


