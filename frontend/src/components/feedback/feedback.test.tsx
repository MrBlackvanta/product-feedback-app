import type { Comment } from "@/data";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AddComment from "./add-comment";
import CommentList from "./comment-list";
import DetailHeader from "./detail-header";

vi.mock("@/lib/actions", () => ({
  postComment: vi.fn(),
  postReply: vi.fn(),
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
    render(<CommentList id={1} count={1} comments={[comment()]} />);

    expect(
      screen.getByRole("heading", { name: "1 Comment" }),
    ).toBeInTheDocument();
  });

  it("names the region after its own heading", () => {
    render(<CommentList id={1} count={4} comments={[comment()]} />);

    expect(screen.getByRole("region", { name: "4 Comments" })).toBeVisible();
  });

  it("reports the server's total, which counts replies the list nests", () => {
    const comments = [
      comment({
        replies: [
          { id: 9, replyingTo: "hexagon", content: "Agreed.", author: other },
        ],
      }),
    ];

    render(<CommentList id={1} count={2} comments={comments} />);

    expect(screen.getByRole("heading", { name: "2 Comments" })).toBeVisible();
    expect(screen.getAllByRole("list")).toHaveLength(2);
  });

  it("says so when nothing has been posted yet", () => {
    render(<CommentList id={1} count={0} comments={[]} />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText(/no comments yet/i)).toBeVisible();
  });

  it("takes a reply's mention from replyingTo, never from its text", () => {
    const comments = [
      comment({
        replies: [
          {
            id: 9,
            replyingTo: "upbeat1811",
            content: "Agreed, and @someone-else is wrong.",
            author: other,
          },
        ],
      }),
    ];

    render(<CommentList id={1} count={2} comments={comments} />);

    expect(screen.getByText("@upbeat1811")).toBeVisible();
  });

  it("gives each Reply button a distinct accessible name", () => {
    const comments = [comment({ id: 1 }), comment({ id: 2, author: other })];

    render(<CommentList id={1} count={2} comments={comments} />);

    const names = screen
      .getAllByRole("button", { name: /reply/i })
      .map((button) => button.textContent);

    expect(new Set(names).size).toBe(2);
  });

  it("opens a reply form only for the comment whose button was pressed", async () => {
    const user = userEvent.setup();
    const comments = [comment({ id: 1 }), comment({ id: 2, author: other })];

    render(<CommentList id={1} count={2} comments={comments} />);

    const [first] = screen.getAllByRole("button", { name: /reply/i });

    expect(first).toHaveAttribute("aria-expanded", "false");
    await user.click(first);

    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });
});

describe("AddComment", () => {
  it("labels the field and counts down from the limit it enforces", async () => {
    const user = userEvent.setup();

    render(<AddComment id={1} />);

    const field = screen.getByRole("textbox", { name: /add a comment/i });

    expect(field).toHaveAttribute("maxLength", "250");
    expect(screen.getByText("250 characters left")).toBeVisible();

    await user.type(field, "Hello");

    expect(screen.getByText("245 characters left")).toBeVisible();
  });

  it("refuses whitespace and marks the field invalid", async () => {
    const user = userEvent.setup();
    const { postComment } = await import("@/lib/actions");

    render(<AddComment id={1} />);

    const field = screen.getByRole("textbox", { name: /add a comment/i });

    await user.type(field, "   ");
    await user.click(screen.getByRole("button", { name: /post comment/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /write a comment/i,
    );
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(postComment).not.toHaveBeenCalled();
  });
});
