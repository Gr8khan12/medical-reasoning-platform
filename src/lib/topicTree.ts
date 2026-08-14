import { supabase } from "./supabaseClient";

// Recursively finds every disease nested under a topic, at any depth
export async function getAllDiseasesUnderTopic(topicName: string, system: string): Promise<any[]> {
  const { data: directDiseases } = await supabase
    .from("Diseases")
    .select("*")
    .eq("topic", topicName);

  const { data: childTopics } = await supabase
    .from("Topics")
    .select("*")
    .eq("parent_topic", topicName)
    .eq("system", system);

  let allDiseases = directDiseases ?? [];

  if (childTopics && childTopics.length > 0) {
    for (const child of childTopics) {
      const nested = await getAllDiseasesUnderTopic(child.name, system);
      allDiseases = allDiseases.concat(nested);
    }
  }

  return allDiseases;
}