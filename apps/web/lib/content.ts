import type { Json } from "@repo/database";

import { projects as seedProjects } from "../data/projects";
import { services as seedServices } from "../data/services";
import { testimonials as seedTestimonials } from "../data/testimonials";
import { createPublicClient } from "./supabase/public";

function isObject(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(value: Json, key: string) {
  if (!isObject(value)) return undefined;
  const field = value[key];
  return typeof field === "string" ? field : undefined;
}

export async function getHomeServices() {
  const supabase = createPublicClient();

  if (supabase) {
    const { data } = await supabase
      .from("services")
      .select("id, slug, title, short_description, position")
      .order("position")
      .limit(9);

    if (data?.length) {
      return data.map((service, index) => ({
        description: service.short_description || "",
        id: service.id,
        number: String(index + 1).padStart(2, "0"),
        seed: false,
        slug: service.slug,
        title: service.title,
      }));
    }
  }

  return seedServices.map((service) => ({
    ...service,
    id: "seed-service-" + service.number,
    seed: true,
    slug: service.title.toLowerCase().replaceAll(" ", "-"),
  }));
}

export async function getHomeProjects() {
  const supabase = createPublicClient();

  if (supabase) {
    const { data } = await supabase
      .from("projects")
      .select("id, slug, title, year, content, is_seed")
      .order("published_at", { ascending: false })
      .limit(8);

    if (data?.length) {
      return data.map((project) => ({
        category: stringField(project.content, "category") || "Case study",
        id: project.id,
        seed: project.is_seed,
        slug: project.slug,
        title: project.title,
        year: project.year?.toString() || "—",
      }));
    }
  }

  return seedProjects.map((project, index) => ({
    ...project,
    id: "seed-project-" + index,
    seed: true,
    slug: project.title.toLowerCase().replaceAll(" ", "-"),
  }));
}

export async function getHomeTestimonials() {
  const supabase = createPublicClient();

  if (supabase) {
    const { data } = await supabase
      .from("testimonials")
      .select(
        "id, quote, person_name, person_role, company_name, position, is_verified",
      )
      .order("position")
      .limit(6);

    if (data?.length) {
      return data.map((testimonial) => ({
        id: testimonial.id,
        name: testimonial.person_name,
        quote: testimonial.quote,
        role: [testimonial.person_role, testimonial.company_name]
          .filter(Boolean)
          .join(", "),
        verified: testimonial.is_verified,
      }));
    }
  }

  return seedTestimonials.map((testimonial, index) => ({
    ...testimonial,
    id: "seed-testimonial-" + index,
    verified: false,
  }));
}
