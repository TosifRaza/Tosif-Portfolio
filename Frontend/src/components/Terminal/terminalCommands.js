import { api, apiUrl } from '@/utils/api';

// Portfolio answers come from saved content, including empty states.
export const commands = [
  {
    name: 'help',
    description: 'Show available commands',
    handler: () => commands.map(({ name, description }) => name + ': ' + description).join('\n'),
  },
  {
    name: 'about',
    description: 'About the portfolio owner',
    handler: async () => {
      const profile = await api.getProfile();
      return [profile.name, profile.title, profile.location, profile.longBio || profile.shortBio]
        .filter(Boolean).join('\n') || 'No profile has been added yet.';
    },
  },
  {
    name: 'skills',
    description: 'List published skills',
    handler: async () => {
      const skills = await api.getSkills();
      return skills.map((skill) => skill.name).join('\n') || 'No skills have been added yet.';
    },
  },
  {
    name: 'projects',
    description: 'Show published projects',
    handler: async () => {
      const projects = await api.getProjects();
      return projects.map((project) => project.title).join('\n') || 'No projects have been published yet.';
    },
  },
  {
    name: 'resume',
    description: 'Find the uploaded resume',
    handler: async () => {
      const resume = await api.getResume();
      return resume?.fileUrl ? 'Resume: ' + apiUrl(resume.fileUrl) : 'No resume has been uploaded yet.';
    },
  },
  {
    name: 'hire',
    description: 'Read the professional introduction',
    handler: async () => {
      const profile = await api.getProfile();
      return profile.pitch || profile.shortBio || 'A professional introduction has not been added yet.';
    },
  },
  {
    name: 'contact',
    description: 'Show published contact details',
    handler: async () => {
      const profile = await api.getProfile();
      return [profile.email, profile.phone, ...Object.values(profile.socials || {})]
        .filter((value) => typeof value === 'string' && value).join('\n')
        || 'No contact details have been added yet.';
    },
  },
  { name: 'edit', description: 'Edit live website text', handler: () => '__CONTENT__' },
  { name: 'colors', description: 'Change or restore site colors', handler: () => '__COLORS__' },
  { name: 'matrix', description: 'Enter the matrix', handler: () => '__MATRIX__' },
  { name: 'coffee', description: 'Brew some coffee', handler: () => 'Coffee machine not connected. Time for a break!' },
  { name: 'sudo', description: 'Try it ;)', handler: () => 'There is no sudo. Only build.' },
  { name: 'exit', description: 'Exit terminal', handler: () => 'Use the close button to exit the terminal.' },
];

export async function getCommandResponse(input) {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === 'clear') return '__CLEAR__';
  const command = commands.find(({ name }) => name === trimmed);
  if (!command) return "Command not found: " + input + "\nType 'help' for available commands.";
  try {
    return await command.handler();
  } catch (error) {
    return error.message || 'Unable to load portfolio content. Please try again.';
  }
}
