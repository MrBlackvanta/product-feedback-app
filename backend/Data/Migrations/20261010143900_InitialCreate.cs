using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FeedbackApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(name: "feedback");

            migrationBuilder.CreateTable(
                name: "feedback",
                schema: "feedback",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    title = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: false
                    ),
                    category = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: false
                    ),
                    status = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: false
                    ),
                    upvotes = table.Column<int>(type: "integer", nullable: false),
                    description = table.Column<string>(
                        type: "character varying(250)",
                        maxLength: 250,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feedback", x => x.id);
                    table.CheckConstraint(
                        "ck_feedback_category",
                        "\"category\" in ('ui', 'ux', 'enhancement', 'bug', 'feature')"
                    );
                    table.CheckConstraint(
                        "ck_feedback_status",
                        "\"status\" in ('suggestion', 'planned', 'in-progress', 'live')"
                    );
                    table.CheckConstraint("ck_feedback_upvotes", "\"upvotes\" >= 0");
                }
            );

            migrationBuilder.CreateTable(
                name: "users",
                schema: "feedback",
                columns: table => new
                {
                    username = table.Column<string>(
                        type: "character varying(40)",
                        maxLength: 40,
                        nullable: false
                    ),
                    name = table.Column<string>(
                        type: "character varying(60)",
                        maxLength: 60,
                        nullable: false
                    ),
                    avatar = table.Column<string>(
                        type: "character varying(40)",
                        maxLength: 40,
                        nullable: false
                    ),
                    is_current = table.Column<bool>(type: "boolean", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.username);
                }
            );

            migrationBuilder.CreateTable(
                name: "comments",
                schema: "feedback",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    feedback_id = table.Column<int>(type: "integer", nullable: false),
                    content = table.Column<string>(
                        type: "character varying(250)",
                        maxLength: 250,
                        nullable: false
                    ),
                    author_username = table.Column<string>(
                        type: "character varying(40)",
                        maxLength: 40,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_comments", x => x.id);
                    table.ForeignKey(
                        name: "fk_comments_feedback_feedback_id",
                        column: x => x.feedback_id,
                        principalSchema: "feedback",
                        principalTable: "feedback",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_comments_users_author_username",
                        column: x => x.author_username,
                        principalSchema: "feedback",
                        principalTable: "users",
                        principalColumn: "username",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "replies",
                schema: "feedback",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    comment_id = table.Column<int>(type: "integer", nullable: false),
                    replying_to = table.Column<string>(
                        type: "character varying(40)",
                        maxLength: 40,
                        nullable: false
                    ),
                    content = table.Column<string>(
                        type: "character varying(250)",
                        maxLength: 250,
                        nullable: false
                    ),
                    author_username = table.Column<string>(
                        type: "character varying(40)",
                        maxLength: 40,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_replies", x => x.id);
                    table.ForeignKey(
                        name: "fk_replies_comments_comment_id",
                        column: x => x.comment_id,
                        principalSchema: "feedback",
                        principalTable: "comments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_replies_users_author_username",
                        column: x => x.author_username,
                        principalSchema: "feedback",
                        principalTable: "users",
                        principalColumn: "username",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_replies_users_replying_to",
                        column: x => x.replying_to,
                        principalSchema: "feedback",
                        principalTable: "users",
                        principalColumn: "username",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_comments_author_username",
                schema: "feedback",
                table: "comments",
                column: "author_username"
            );

            migrationBuilder.CreateIndex(
                name: "ix_comments_feedback_id",
                schema: "feedback",
                table: "comments",
                column: "feedback_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_replies_author_username",
                schema: "feedback",
                table: "replies",
                column: "author_username"
            );

            migrationBuilder.CreateIndex(
                name: "ix_replies_comment_id",
                schema: "feedback",
                table: "replies",
                column: "comment_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_replies_replying_to",
                schema: "feedback",
                table: "replies",
                column: "replying_to"
            );

            migrationBuilder.CreateIndex(
                name: "ix_users_is_current",
                schema: "feedback",
                table: "users",
                column: "is_current",
                unique: true,
                filter: "\"is_current\""
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "replies", schema: "feedback");

            migrationBuilder.DropTable(name: "comments", schema: "feedback");

            migrationBuilder.DropTable(name: "feedback", schema: "feedback");

            migrationBuilder.DropTable(name: "users", schema: "feedback");
        }
    }
}
