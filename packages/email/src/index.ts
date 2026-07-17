export type ContactEmailData = {
  budgetRange?: string;
  company?: string;
  email: string;
  message: string;
  name: string;
  requestedServices: string[];
  timeframe?: string;
};

export type RenderedEmail = {
  html: string;
  subject: string;
  text: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailFrame(content: string) {
  return [
    "<!doctype html><html lang='en'>",
    "<body style='margin:0;background:#f2f0ea;color:#161613;font-family:Arial,sans-serif'>",
    "<table role='presentation' width='100%' cellspacing='0' cellpadding='0'><tr>",
    "<td style='padding:32px 16px'><table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:640px;margin:0 auto;background:#fff;border:1px solid #ddd9cf;border-radius:18px'>",
    "<tr><td style='padding:34px 38px;border-bottom:1px solid #e6e2d9'><strong style='font-size:20px'>eMotion</strong><span style='float:right;color:#88847b;font-size:11px;letter-spacing:.12em;text-transform:uppercase'>agency OS</span></td></tr>",
    "<tr><td style='padding:38px'>",
    content,
    "</td></tr><tr><td style='padding:24px 38px;color:#8a867d;background:#171715;border-radius:0 0 18px 18px;font-size:12px'>emotion.com · info@emotion.com</td></tr>",
    "</table></td></tr></table></body></html>",
  ].join("");
}

export function renderContactNotification(
  data: ContactEmailData,
): RenderedEmail {
  const services = data.requestedServices.length
    ? data.requestedServices.join(", ")
    : "Not specified";
  const rows = [
    ["Name", data.name],
    ["Email", data.email],
    ["Company", data.company || "Not specified"],
    ["Services", services],
    ["Budget", data.budgetRange || "Not specified"],
    ["Timeframe", data.timeframe || "Not specified"],
  ]
    .map(
      ([label, value]) =>
        "<tr><td style='padding:8px 14px 8px 0;color:#8a867d;font-size:12px'>" +
        escapeHtml(label || "") +
        "</td><td style='padding:8px 0;font-size:13px'>" +
        escapeHtml(value || "") +
        "</td></tr>",
    )
    .join("");

  return {
    subject: "New eMotion inquiry — " + data.name,
    html: emailFrame(
      "<p style='margin:0 0 8px;color:#78746d;font-size:11px;letter-spacing:.12em;text-transform:uppercase'>New project inquiry</p>" +
        "<h1 style='margin:0 0 26px;font-size:38px;line-height:1.05;letter-spacing:-.04em'>A new conversation has started.</h1>" +
        "<table role='presentation' cellspacing='0' cellpadding='0' style='width:100%;margin-bottom:28px'>" +
        rows +
        "</table><div style='padding:22px;background:#f2f0ea;border-radius:10px;white-space:pre-wrap;line-height:1.65'>" +
        escapeHtml(data.message) +
        "</div>",
    ),
    text: [
      "New eMotion project inquiry",
      "Name: " + data.name,
      "Email: " + data.email,
      "Company: " + (data.company || "Not specified"),
      "Services: " + services,
      "Budget: " + (data.budgetRange || "Not specified"),
      "Timeframe: " + (data.timeframe || "Not specified"),
      "",
      data.message,
    ].join("\n"),
  };
}

export function renderContactConfirmation(
  data: ContactEmailData,
): RenderedEmail {
  return {
    subject: "We received your eMotion project brief",
    html: emailFrame(
      "<p style='margin:0 0 8px;color:#78746d;font-size:11px;letter-spacing:.12em;text-transform:uppercase'>Project brief received</p>" +
        "<h1 style='margin:0 0 22px;font-size:38px;line-height:1.05;letter-spacing:-.04em'>Thank you, " +
        escapeHtml(data.name) +
        ".</h1><p style='margin:0;color:#5f5c56;font-size:15px;line-height:1.7'>Your brief is safely in our workspace. We will review the context and reply from <strong>info@emotion.com</strong>. No automated proposal, no generic sales sequence — a real person will continue the conversation.</p>",
    ),
    text:
      "Thank you, " +
      data.name +
      ". Your project brief is safely in our workspace. We will review it and reply from info@emotion.com.",
  };
}
