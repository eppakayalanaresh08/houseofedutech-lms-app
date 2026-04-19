import type { Course } from '@/src/types/domain';

export function buildCourseHtml(course: Course, metadata: Record<string, string>) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${course.title}</title>
      <style>
        body {
          margin: 0;
          font-family: Georgia, 'Times New Roman', serif;
          background: #f7f0e4;
          color: #1f2a37;
        }
        .hero {
          padding: 32px 24px;
          background: linear-gradient(180deg, #1e3a5f 0%, #325779 100%);
          color: #fff8eb;
        }
        .sheet {
          margin: -20px 16px 24px;
          padding: 20px;
          border-radius: 20px;
          background: #fcf8f0;
          box-shadow: 0 10px 30px rgba(30, 58, 95, 0.12);
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
        button {
          width: 100%;
          margin-top: 20px;
          border: none;
          border-radius: 14px;
          padding: 14px;
          background: #b88932;
          color: #fff8eb;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <section class="hero">
        <p>Embedded lesson viewer</p>
        <h1>${course.title}</h1>
        <p>${course.instructor.name} | ${course.level}</p>
      </section>
      <section class="sheet">
        <h2>Course Summary</h2>
        <p>${course.description}</p>
        <div class="meta">
          <div class="tile"><strong>${course.lessons}</strong><br />Lessons</div>
          <div class="tile"><strong>${course.durationMinutes} min</strong><br />Duration</div>
          <div class="tile"><strong>${course.category}</strong><br />Category</div>
          <div class="tile"><strong>${metadata['x-course-context'] ?? 'native-bridge'}</strong><br />Native Context</div>
        </div>
        <button id="complete">Mark current chapter complete</button>
      </section>
      <script>
        window.__NATIVE_HEADERS__ = ${JSON.stringify(metadata)};
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
