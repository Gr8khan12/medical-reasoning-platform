import { supabase } from "./supabaseClient";

// Recursively finds every concept name nested under a topic, at any depth —
// whether concepts are linked directly to the topic, or linked via a disease under it
export async function getAllConceptsUnderTopic(topicName: string, system: string): Promise<string[]> {
  const { data: directConcepts } = await supabase
    .from("Concepts")
    .select("name")
    .eq("topic", topicName)
    .eq("topic_system", system);

  const { data: diseasesHere } = await supabase
    .from("Diseases")
    .select("name")
    .eq("topic", topicName);

  const diseaseNames = (diseasesHere ?? []).map((d) => d.name);
  let diseaseConcepts: string[] = [];
  if (diseaseNames.length > 0) {
    const { data: viaDisease } = await supabase
      .from("Concepts")
      .select("name")
      .in("disease", diseaseNames);
    diseaseConcepts = (viaDisease ?? []).map((c) => c.name);
  }

  const { data: childTopics } = await supabase
    .from("Topics")
    .select("*")
    .eq("parent_topic", topicName)
    .eq("system", system);

  let allConceptNames = [
    ...(directConcepts ?? []).map((c) => c.name),
    ...diseaseConcepts,
  ];

  if (childTopics && childTopics.length > 0) {
    for (const child of childTopics) {
      const nested = await getAllConceptsUnderTopic(child.name, system);
      allConceptNames = allConceptNames.concat(nested);
    }
  }

  return allConceptNames;
}