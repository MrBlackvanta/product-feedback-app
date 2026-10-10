import type { Comment, User } from "@/data";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddComment from "./add-comment";
import CommentList from "./comment-list";
import Conversation from "./conversation";
import DetailHeader from "./detail-header";

vi.mock("@/lib/actions", () => ({
  postComment: vi.fn(),
  postReply: vi.fn(),
  editEntry: vi.fn(),
  removeEntry: vi.fn(),
  castUpvote: vi.fn(),
}));

const author = { name: "Elijah Moss", username: "hexagon", avatar: "elijah" };
const other = {
  name: "Anne Valentine",
  username: "annev1990",
  avatar: "aaron",
};

const comment = (over: Partial<Comment> = {}): Comment => ({
  id: 1,
  content: "Worth doing.",
  author,
  replies: [],
  ...over,
});

const answered = (over: Partial<Comment> = {}) =>
  comment({
    replies: [
      { id: 9, replyingTo: "hexagon", content: "Agreed.", author: other },
    ],
    ...over,
  });

function show(comments: Comment[], viewer: User = author) {
  return render(
    <Conversation id={1} viewer={viewer} comments={comments}>
      <CommentList />
      <AddComment />
    </Conversation>,
  );
}

const commentField = () =>
  screen.getByRole("textbox", { name: /add a comment/i });

function inFlight() {
  let land = () => {};
  const promise = new Promise<void>((resolve) => {
    land = resolve;
  });

  return { promise, land: () => act(async () => land()) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DetailHeader", () => {
  it("sends Go Back to the board and Edit to this request's edit route", () => {
    render(<DetailHeader id={7} />);

    expect(screen.getByRole("link", { name: /go back/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: /edit feedback/i }),
    ).toHaveAttribute("href", "/feedback/7/edit");
  });
});

describe("CommentList", () => {
  it("counts a single comment in the singular", () => {
    show([comment()]);

    expect(
      screen.getByRole("heading", { name: "1 Comment" }),
    ).toBeInTheDocument();
  });

  it("counts the replies it nests, not just the comments", () => {
    show([answered()]);

    expect(screen.getByRole("heading", { name: "2 Comments" })).toBeVisible();
    expect(screen.getByRole("region", { name: "2 Comments" })).toBeVisible();
  });

  it("says so when nothing has been posted yet", () => {
    show([]);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText(/no comments yet/i)).toBeVisible();
  });

  it("takes a reply's mention from replyingTo, never from its text", () => {
    show([
      answered({
        replies: [
          {
            id: 9,
            replyingTo: "upbeat1811",
            content: "Agreed, and @someone-else is wrong.",
            author: other,
          },
        ],
      }),
    ]);

    expect(screen.getByText("@upbeat1811")).toBeVisible();
  });

  it("gives each Reply button a distinct accessible name", () => {
    show([comment({ id: 1 }), comment({ id: 2, author: other })]);

    const names = screen
      .getAllByRole("button", { name: /^reply/i })
      .map((button) => button.textContent);

    expect(new Set(names).size).toBe(2);
  });

  it("opens a reply form only for the comment whose button was pressed", async () => {
    const user = userEvent.setup();

    show([comment({ id: 1 }), comment({ id: 2, author: other })]);

    const [first] = screen.getAllByRole("button", { name: /^reply/i });

    expect(first).toHaveAttribute("aria-expanded", "false");
    await user.click(first);

    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("textbox", { name: /reply to/i })).toHaveLength(
      1,
    );
  });
});

describe("ownership", () => {
  it("offers Edit and Delete on the reader's own entries only", () => {
    show([comment({ id: 1 }), comment({ id: 2, author: other })]);

    expect(screen.getAllByRole("button", { name: /^edit/i })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: /^delete/i })).toHaveLength(1);
  });

  it("offers nothing to edit when every entry belongs to somebody else", () => {
    show([comment({ author: other })], author);

    expect(
      screen.queryByRole("button", { name: /^edit/i }),
    ).not.toBeInTheDocument();
  });
});

describe("AddComment", () => {
  it("labels the field and counts down from the limit it enforces", async () => {
    const user = userEvent.setup();

    show([]);

    expect(commentField()).toHaveAttribute("maxLength", "250");
    expect(screen.getByText("250 characters left")).toBeVisible();

    await user.type(commentField(), "Hello");

    expect(screen.getByText("245 characters left")).toBeVisible();
  });

  it("refuses whitespace and marks the field invalid", async () => {
    const user = userEvent.setup();
    const { postComment } = await import("@/lib/actions");

    show([]);

    await user.type(commentField(), "   ");
    await user.click(screen.getByRole("button", { name: /post comment/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /write a comment/i,
    );
    expect(commentField()).toHaveAttribute("aria-invalid", "true");
    expect(postComment).not.toHaveBeenCalled();
  });

  it("shows the comment and its new total before the server answers", async () => {
    const user = userEvent.setup();
    const { postComment } = await import("@/lib/actions");
    const posting = inFlight();

    vi.mocked(postComment).mockReturnValue(posting.promise);

    show([comment()]);

    await user.type(commentField(), "Second this.");
    await user.click(screen.getByRole("button", { name: /post comment/i }));

    expect(await screen.findByText("Second this.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "2 Comments" })).toBeVisible();
    expect(commentField()).toHaveValue("");

    await posting.land();
  });

  it("submits on Ctrl+Enter and leaves Enter to break the line", async () => {
    const user = userEvent.setup();
    const { postComment } = await import("@/lib/actions");

    show([]);

    await user.click(commentField());
    await user.keyboard("One{Enter}Two");

    expect(postComment).not.toHaveBeenCalled();
    expect(commentField()).toHaveValue("One\nTwo");

    await user.keyboard("{Control>}{Enter}{/Control}");

    expect(postComment).toHaveBeenCalledWith(1, "One\nTwo");
  });
});

describe("a post the server refuses", () => {
  it("keeps the text on screen, out of the count, with a way back", async () => {
    const user = userEvent.setup();
    const { postComment } = await import("@/lib/actions");

    vi.mocked(postComment).mockRejectedValue(new Error("offline"));

    show([comment()]);

    await user.type(commentField(), "Second this.");
    await user.click(screen.getByRole("button", { name: /post comment/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/never left/i);
    expect(screen.getByText("Second this.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "1 Comment" })).toBeVisible();
  });

  it("sends it again on Try again", async () => {
    const user = userEvent.setup();
    const { postComment } = await import("@/lib/actions");

    vi.mocked(postComment).mockRejectedValue(new Error("offline"));

    show([]);

    await user.type(commentField(), "Second this.");
    await user.click(screen.getByRole("button", { name: /post comment/i }));
    await screen.findByRole("alert");

    vi.mocked(postComment).mockResolvedValue(undefined);
    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(postComment).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("drops it on Dismiss", async () => {
    const user = userEvent.setup();
    const { postComment } = await import("@/lib/actions");

    vi.mocked(postComment).mockRejectedValue(new Error("offline"));

    show([]);

    await user.type(commentField(), "Second this.");
    await user.click(screen.getByRole("button", { name: /post comment/i }));
    await screen.findByRole("alert");

    await user.click(screen.getByRole("button", { name: /dismiss/i }));

    await waitFor(() =>
      expect(screen.queryByText("Second this.")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/no comments yet/i)).toBeVisible();
  });
});

describe("editing and deleting", () => {
  it("seeds the editor with the comment and saves what the reader leaves", async () => {
    const user = userEvent.setup();
    const { editEntry } = await import("@/lib/actions");
    const saving = inFlight();

    vi.mocked(editEntry).mockReturnValue(saving.promise);

    show([comment()]);

    await user.click(screen.getByRole("button", { name: /^edit/i }));

    const editor = screen.getByRole("textbox", { name: /edit your comment/i });

    expect(editor).toHaveValue("Worth doing.");

    await user.clear(editor);
    await user.type(editor, "Worth doing soon.");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(editEntry).toHaveBeenCalledWith("comment", 1, "Worth doing soon.");
    expect(await screen.findByText("Worth doing soon.")).toBeVisible();

    await saving.land();
  });

  it("leaves the comment alone when the editor is cancelled", async () => {
    const user = userEvent.setup();
    const { editEntry } = await import("@/lib/actions");

    show([comment()]);

    await user.click(screen.getByRole("button", { name: /^edit/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(editEntry).not.toHaveBeenCalled();
    expect(screen.getByText("Worth doing.")).toBeVisible();
  });

  it("takes the comment off the page as soon as the delete is confirmed", async () => {
    const user = userEvent.setup();
    const { removeEntry } = await import("@/lib/actions");
    const removing = inFlight();

    vi.mocked(removeEntry).mockReturnValue(removing.promise);

    show([answered()]);

    await user.click(screen.getByRole("button", { name: /^delete/i }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(removeEntry).toHaveBeenCalledWith("comment", 1);
    expect(screen.getByText(/no comments yet/i)).toBeVisible();

    await removing.land();
  });
});
