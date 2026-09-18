import { ContactForm } from "@/components/contact-form";
import { TextField, TextAreaField } from "@/components/form-field";

// The site's one enquiry form. The home page contact section, /book and
// /sponsor all render this exact component, so there is a single set of
// fields, a single schema, and a single success message to keep true.
//
// Four fields, three of them required. The old /book quote form asked for
// service type, event date, budget, venue size, name and email before anyone
// had said hello, which is a lot of typing to start a conversation that ends
// in a phone call anyway.

type Props = {
  /** formsubmit.co subject line, so the inbox shows which page sent it. */
  subject: string;
  /** Source tag stored in the payload alongside the referrer. */
  source: string;
  /** Plausible "Form Submit" prop. */
  formName: string;
  /** Submit button label. */
  submitLabel?: string;
  /** Prefix for the field ids, so two instances never collide on one page. */
  idPrefix?: string;
  /** Placeholder for the free-text field, tuned per page. */
  planningPlaceholder?: string;
};

export function BookingEnquiry({
  subject,
  source,
  formName,
  submitLabel = "Send it",
  idPrefix = "enquiry",
  planningPlaceholder = "A show, an event, a set you want filmed, a podcast. Rough details are fine.",
}: Props) {
  return (
    <ContactForm
      subject={subject}
      source={source}
      formName={formName}
      schema="bookingEnquiry"
      submitLabel={submitLabel}
      successEvents={[{ name: "Enquiry Submitted", props: { source: formName } }]}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id={`${idPrefix}-name`}
          name="name"
          label="Your name"
          required
          autoComplete="name"
        />
        <TextField
          id={`${idPrefix}-email`}
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <TextAreaField
        id={`${idPrefix}-planning`}
        name="planning"
        label="What are you planning?"
        required
        rows={5}
        placeholder={planningPlaceholder}
      />
      <div className="sm:max-w-[16rem]">
        <TextField
          id={`${idPrefix}-date`}
          name="eventDate"
          label="Date"
          type="date"
          optional
        />
      </div>
    </ContactForm>
  );
}
