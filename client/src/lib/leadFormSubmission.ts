export type LeadSubmissionPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function submitLeadForm(payload: LeadSubmissionPayload) {
  const response = await fetch(
    "https://formsubmit.co/ajax/kyle@stonedgooseproductions.com",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("We couldn’t send the request. Please try again.");
  }

  return response;
}
