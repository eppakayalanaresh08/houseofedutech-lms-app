import type { Course } from "@/src/types/domain";

export function buildCourseHtml(course: Course) {
  const chapterLength = Math.max(
    8,
    Math.round(course.durationMinutes / Math.max(course.lessons, 1)),
  );
  const lessonModules = [
    {
      title: `Lesson 1: Foundations of ${course.category}`,
      body: `Start by understanding how ${course.title.toLowerCase()} is structured, what strong outcomes look like, and how to build a steady rhythm for learning. This section introduces the language, goals, and expectations for the rest of the course.`,
      minutes: chapterLength,
    },
    {
      title: `Lesson 2: Guided Practice with ${course.instructor.name}`,
      body: `Work through a practical walkthrough focused on ${course.level.toLowerCase()}-to-advanced techniques. The goal here is to move from passive reading into an applied exercise you could repeat in your own workflow.`,
      minutes: chapterLength + 4,
    },
    {
      title: `Lesson 3: Reflection and Completion Check`,
      body: `Close the lesson by reviewing the main ideas, checking your understanding, and deciding what action you will take next. This final section is designed to support retention and real completion instead of quick scrolling.`,
      minutes: chapterLength - 2,
    },
  ];

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${course.title}</title>
      <style>
        :root {
          color-scheme: light;
        }
        body {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          background: #f7f0e4;
          color: #1f2a37;
        }
        * {
          box-sizing: border-box;
        }
        .hero {
          padding: 24px 22px 30px;
          background:
            radial-gradient(circle at top right, rgba(255, 248, 235, 0.16), transparent 28%),
            linear-gradient(180deg, #183557 0%, #284d72 100%);
          color: #fff8eb;
        }
        .eyebrow {
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          opacity: 0.82;
        }
        .hero h1 {
          margin: 10px 0 10px;
          font-size: 29px;
          line-height: 1.18;
        }
        .hero p {
          margin: 0;
          font-size: 15px;
          line-height: 1.65;
          color: #e9eef5;
        }
        .sheet {
          margin: -18px 16px 24px;
          padding: 20px;
          border-radius: 24px;
          background: #fcf8f0;
          box-shadow: 0 10px 30px rgba(30, 58, 95, 0.12);
        }
        .status-bar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }
        .pill {
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(255, 248, 235, 0.12);
          border: 1px solid rgba(255, 248, 235, 0.18);
          font-size: 12px;
        }
        .section {
          margin-top: 20px;
        }
        .section h2 {
          margin: 0 0 10px;
          font-size: 19px;
          color: #172534;
        }
        .section p {
          margin: 0;
          font-size: 15px;
          line-height: 1.8;
          color: #4a5565;
        }
        .meta {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(2, 1fr);
          margin-top: 16px;
        }
        .tile {
          border: 1px solid #d8c9a8;
          border-radius: 14px;
          padding: 14px;
          background: #fffdf9;
        }
        .tile strong {
          font-size: 17px;
        }
        .lesson-list {
          display: grid;
          gap: 14px;
          margin-top: 16px;
        }
        .lesson-card {
          border: 1px solid #e1d5b8;
          border-radius: 18px;
          padding: 16px;
          background: linear-gradient(180deg, #fffdf9 0%, #faf4e9 100%);
        }
        .lesson-card h3 {
          margin: 0 0 8px;
          font-size: 17px;
          color: #17324f;
        }
        .lesson-card p {
          margin: 0;
          font-size: 14px;
          line-height: 1.75;
          color: #4a5565;
        }
        .lesson-meta {
          margin-top: 12px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #b88932;
        }
        .note {
          margin-top: 18px;
          padding: 16px;
          border-radius: 18px;
          background: #efe5cf;
          color: #5c4720;
        }
        .note strong {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .takeaways {
          margin: 14px 0 0;
          padding-left: 20px;
          color: #445261;
        }
        .takeaways li {
          margin-bottom: 8px;
          line-height: 1.7;
        }
        button {
          width: 100%;
          margin-top: 24px;
          border: none;
          border-radius: 16px;
          padding: 15px;
          background: linear-gradient(180deg, #b88932 0%, #9c6e1f 100%);
          color: #fff8eb;
          font-size: 16px;
          font-weight: 700;
          box-shadow: 0 12px 24px rgba(184, 137, 50, 0.22);
        }
        .footer {
          margin-top: 16px;
          font-size: 13px;
          line-height: 1.7;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <section class="hero">
        <div class="eyebrow">Embedded lesson viewer</div>
        <h1>${course.title}</h1>
        <p>${course.description}</p>
        <div class="status-bar">
          <div class="pill">${course.instructor.name}</div>
          <div class="pill">${course.level}</div>
          <div class="pill">${course.lessons} lessons</div>
        </div>
      </section>
      <section class="sheet">
        <div class="section">
          <h2>Lesson Overview</h2>
          <p>
            This embedded lesson is designed to feel like a focused reading session inside the app.
            You can review the instructor, lesson pace, and course context without leaving the native experience.
          </p>
        </div>

        <div class="meta">
          <div class="tile"><strong>${course.lessons}</strong><br />Lessons</div>
          <div class="tile"><strong>${course.durationMinutes} min</strong><br />Duration</div>
          <div class="tile"><strong>${course.category}</strong><br />Category</div>
          <div class="tile"><strong id="native-context">Waiting...</strong><br />Native Context</div>
        </div>

        <div class="section">
          <h2>Today’s Lesson Path</h2>
          <div class="lesson-list">
            ${lessonModules
              .map(
                (module, index) => `
                  <article class="lesson-card">
                    <h3>${module.title}</h3>
                    <p>${module.body}</p>
                    <div class="lesson-meta">Module ${index + 1} • ${module.minutes} min focus block</div>
                  </article>`,
              )
              .join("")}
          </div>
        </div>

        <div class="section">
          <h2>Key Takeaways</h2>
          <ul class="takeaways">
            <li>Understand the structure and outcome of this lesson before moving to deeper topics.</li>
            <li>Use the guided practice section to turn ideas into repeatable actions.</li>
            <li>Complete the reflection step so progress in the native app feels meaningful.</li>
          </ul>
        </div>

        <div class="note">
          <strong>Study Note</strong>
          A calm, structured lesson layout improves completion because the learner understands what is happening next.
          That is why this viewer uses a clear sequence of overview, guided practice, and completion.
        </div>

        <button id="complete">Mark This Lesson Complete</button>
       
      </section>
      <script>
        var nativeHeaders = window.__NATIVE_HEADER_BRIDGE__ || {};
        document.getElementById('native-context').textContent =
          nativeHeaders['x-course-context'] || 'native-bridge';

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'viewer_ready',
            courseId: '${course.id}',
            renderMode: nativeHeaders['x-render-mode'] || 'unknown'
          }));
        }

        document.getElementById('complete').addEventListener('click', function () {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'chapter_complete',
            courseId: '${course.id}'
          }));
        });
      </script>
    </body>
  </html>`;
}
