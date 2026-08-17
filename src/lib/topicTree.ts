import { supabase } from "./supabaseClient";

// Recursively finds every concept name nested under a topic, at any depth —
// whether concepts are linked directly to the topic, or linked via a disease under it
export async function getAllConceptsUnderTopic(topicName: string, system: string): Promise<string[]> {
  const [directResult, diseasesResult, childTopicsResult] = await Promise.all([
    supabase.from("Concepts").select("name").eq("topic", topicName).eq("topic_system", system),
    supabase.from("Diseases").select("name").eq("topic", topicName),
    supabase.from("Topics").select("*").eq("parent_topic", topicName).eq("system", system),
  ]);

  const directConcepts = directResult.data ?? [];
  const diseaseNames = (diseasesResult.data ?? []).map((d) => d.name);
  const childTopics = childTopicsResult.data ?? [];

  let diseaseConcepts: string[] = [];
  if (diseaseNames.length > 0) {
    const { data: viaDisease } = await supabase
      .from("Concepts")
      .select("name")
      .in("disease", diseaseNames);
    diseaseConcepts = (viaDisease ?? []).map((c) => c.name);
  }

  const nestedResults = await Promise.all(
    childTopics.map((child) => getAllConceptsUnderTopic(child.name, system))
  );

  return [
    ...directConcepts.map((c) => c.name),
    ...diseaseConcepts,
    ...nestedResults.flat(),
  ];
}

// Same idea, but returns full concept rows (with content) instead of just names
export async function getAllConceptDataUnderTopic(topicName: string, system: string): Promise<any[]> {
  const names = await getAllConceptsUnderTopic(topicName, system);
  if (names.length === 0) return [];

  const { data } = await supabase
    .from("Concepts")
    .select("*")
    .in("name", names);

  return data ?? [];
}