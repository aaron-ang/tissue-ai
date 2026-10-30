"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";

import "./issues.css";
import { GitHubIssueAnalysis, FlattenedFile } from "../../lib/api";

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

function parseAnalysisData(raw: string | null): {
  analysis: GitHubIssueAnalysis;
  flattenedFiles: FlattenedFile[];
} | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error parsing analysis data:", error);
    return null;
  }
}

export default function IssuesPage() {
  const router = useRouter();
  const [showSummary, setShowSummary] = useState(true);
  // undefined during prerender and hydration, so the server and first client
  // render agree; the client snapshot is read after hydration.
  const analysisDataStr = useSyncExternalStore<string | null | undefined>(
    subscribeToStorage,
    () => localStorage.getItem("analysisData"),
    () => undefined,
  );
  const analysisData = useMemo(
    () =>
      analysisDataStr === undefined
        ? undefined
        : parseAnalysisData(analysisDataStr),
    [analysisDataStr],
  );
  const analysis = analysisData?.analysis ?? null;
  const flattenedFiles = analysisData?.flattenedFiles ?? [];
  const [pickedFile, setPickedFile] = useState<FlattenedFile | null>(null);
  const selectedFile = pickedFile ?? flattenedFiles[0] ?? null;

  useEffect(() => {
    // No usable data in localStorage: send the user back to start an analysis.
    if (analysisData === null) {
      router.push("/");
    }
  }, [analysisData, router]);

  // Show loading if no analysis data yet
  if (!analysis) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-black z-0" />
        <div
          className="absolute inset-0 z-9"
          style={{
            backgroundImage: 'url("/purpleBackground2.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.9,
          }}
        />
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative max-h-screen">
      {/* Background layers */}
      <div className="absolute inset-0 bg-black z-0" />
      <div
        className="absolute inset-0 z-9"
        style={{
          backgroundImage: 'url("/purpleBackground2.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.9,
        }}
      />

      {/* Main Content Grid */}
      <div className="relative z-10 max-h-screen flex flex-col p-4 min-h-screen">
        <header className="w-full px-4 py-4 flex items-center justify-center z-10 mb-3">
          {/* Title (centered, truncated with ellipsis) */}
          <h1
            className="text-white text-4xl md:text-5xl lg:text-4xl text-center truncate max-w-full px-16"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
            title={analysis?.issue_summary.title || "Loading..."}
          >
            {analysis?.issue_summary.title || "Loading..."}
          </h1>

          {/* Home Button (top-right) */}
          <Link
            href="/"
            className="absolute right-4 top-1 glass-logo-feature w-16 h-16 rounded-full flex items-center justify-center mb-2"
          >
            <img src="/logo.png" alt="Logo" />
          </Link>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-[500px_1fr] gap-6 flex-1 overflow-hidden min-h-0">
          {/* Left Sidebar */}
          <div className="flex flex-col gap-4 min-h-0">
            {/* Toggle Buttons */}
            <div className="flex gap-4">
              <button
                className={`glass-logo-feature w-16 h-16 rounded-full flex items-center justify-center cursor-pointer ${
                  showSummary ? "opacity-100" : "opacity-60"
                }`}
                onClick={() => setShowSummary(true)}
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="42"
                  height="42"
                >
                  <path
                    d="M0 0 C3.41865168 1.81864319 5.56456983 4.03408009 8 7 C8.68231689 7.58096436 9.36463379 8.16192871 10.06762695 8.76049805 C12.51482853 11.59665472 12.50290747 13.04990671 12.49609375 16.75390625 C12.49673828 17.85541016 12.49738281 18.95691406 12.49804688 20.09179688 C12.47806641 21.23712891 12.45808594 22.38246094 12.4375 23.5625 C12.44458984 24.71169922 12.45167969 25.86089844 12.45898438 27.04492188 C12.39560074 35.36768042 12.39560074 35.36768042 10.85595703 37.82861328 C8.16173552 39.52907037 6.03932164 39.3718459 2.87109375 39.36328125 C1.67162109 39.36263672 0.47214844 39.36199219 -0.76367188 39.36132812 C-2.01728516 39.34521484 -3.27089844 39.32910156 -4.5625 39.3125 C-6.4487207 39.31733398 -6.4487207 39.31733398 -8.37304688 39.32226562 C-17.73311942 39.26688058 -17.73311942 39.26688058 -20 37 C-20.22406625 34.45449442 -20.32810413 32.02075208 -20.3359375 29.47265625 C-20.3425943 28.72793564 -20.3492511 27.98321503 -20.35610962 27.21592712 C-20.36624041 25.63982618 -20.37092651 24.0636823 -20.37060547 22.48754883 C-20.37497741 20.0749651 -20.41128472 17.66421276 -20.44921875 15.25195312 C-20.45508712 13.72136043 -20.45905638 12.19075904 -20.4609375 10.66015625 C-20.47530853 9.93820572 -20.48967957 9.21625519 -20.50448608 8.47242737 C-20.47503432 5.24630225 -20.43680861 3.47116899 -18.19677734 1.05493164 C-12.74524951 -1.5629892 -5.83781748 -0.82239095 0 0 Z M-15 5 C-15 14.57 -15 24.14 -15 34 C-7.74 34 -0.48 34 7 34 C7 27.73 7 21.46 7 15 C3.7 15 0.4 15 -3 15 C-3 11.7 -3 8.4 -3 5 C-6.96 5 -10.92 5 -15 5 Z"
                    fill="#FFFFFF"
                    transform="translate(25,1)"
                  />
                </svg>
              </button>

              <button
                className={`glass-logo-feature w-16 h-16 rounded-full flex items-center justify-center cursor-pointer ${
                  !showSummary ? "opacity-100" : "opacity-60"
                }`}
                onClick={() => setShowSummary(false)}
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="42"
                  height="42"
                >
                  <path
                    d="M0 0 C1.71703125 -0.01546875 1.71703125 -0.01546875 3.46875 -0.03125 C4.4690625 0.1440625 5.469375 0.319375 6.5 0.5 C7.180625 1.48806641 7.180625 1.48806641 7.875 2.49609375 C9.48699537 4.95485081 9.48699537 4.95485081 13.40625 5.00390625 C14.93714124 5.04237752 16.46862598 5.06122172 18 5.0625 C25.92574949 5.10881072 25.92574949 5.10881072 28.21704102 6.66967773 C31.00116608 10.64162552 29.96619724 16.33017571 29.9375 21 C29.9674707 22.73056641 29.9674707 22.73056641 29.99804688 24.49609375 C29.99740234 25.60082031 29.99675781 26.70554687 29.99609375 27.84375 C29.99887329 29.36258789 29.99887329 29.36258789 30.00170898 30.91210938 C29.5 33.5 29.5 33.5 27.89477539 35.33081055 C24.70040878 36.8903805 22.23819991 36.87202565 18.6875 36.86328125 C18.03676514 36.86377975 17.38603027 36.86427826 16.71557617 36.86479187 C15.34388159 36.86245815 13.97218218 36.85277093 12.60058594 36.83618164 C10.50676995 36.81257632 8.41422792 36.81562686 6.3203125 36.82226562 C-5.13476577 36.77444455 -5.13476577 36.77444455 -8.5 34.5 C-10.77901824 29.94196352 -9.7301617 23.62921094 -9.75 18.625 C-9.770625 17.33207031 -9.79125 16.03914063 -9.8125 14.70703125 C-9.81765625 13.46566406 -9.8228125 12.22429688 -9.828125 10.9453125 C-9.8374707 9.80594238 -9.84681641 8.66657227 -9.85644531 7.49267578 C-9.08222595 0.99241486 -6.14134255 -0.05532741 0 0 Z"
                    fill="#F2F2F2"
                    transform="translate(10.5,2.5)"
                  />
                </svg>
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 glass-panel rounded-2xl p-8 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-h-screen">
              <div className="flex-1 min-h-0 pr-2">
                {showSummary ? (
                  <div className="text-white space-y-6">
                    {analysis ? (
                      <>
                        {/* Issue Summary */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-purple-300">
                            Issue Summary
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <strong>Description:</strong>
                              <p className="mt-1 text-gray-300">
                                {analysis.issue_summary.description}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                              <div>
                                <strong>Status:</strong>{" "}
                                <span className="text-green-400">
                                  {analysis.issue_summary.status}
                                </span>
                              </div>
                              <div>
                                <strong>Type:</strong>{" "}
                                <span className="text-blue-400">
                                  {analysis.analysis.problem_type}
                                </span>
                              </div>
                              <div>
                                <strong>Complexity:</strong>{" "}
                                <span className="text-yellow-400">
                                  {analysis.analysis.complexity}
                                </span>
                              </div>
                            </div>
                            {analysis.issue_summary.labels.length > 0 && (
                              <div>
                                <strong>Labels:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {analysis.issue_summary.labels.map(
                                    (label, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-purple-600/30 rounded text-xs"
                                      >
                                        {label}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Project Context */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-purple-300">
                            Project Context
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <strong>Overview:</strong>
                              <p className="mt-1 text-gray-300 text-sm leading-relaxed">
                                {analysis.project_context.overview}
                              </p>
                            </div>
                            <div>
                              <strong>Architecture:</strong>
                              <p className="mt-1 text-gray-300 text-sm leading-relaxed">
                                {analysis.project_context.architecture_overview}
                              </p>
                            </div>
                            {Object.keys(
                              analysis.project_context.main_directories
                            ).length > 0 && (
                              <div>
                                <strong>Key Directories:</strong>
                                <div className="mt-1 space-y-1">
                                  {Object.entries(
                                    analysis.project_context.main_directories
                                  ).map(([dir, desc], index) => (
                                    <div key={index} className="text-sm">
                                      <code className="text-purple-300">
                                        {dir}
                                      </code>{" "}
                                      -{" "}
                                      <span className="text-gray-300">
                                        {desc}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Build & Development */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-purple-300">
                            Build & Development
                          </h3>
                          <div className="space-y-3">
                            {analysis.build_and_test.setup_commands.length >
                              0 && (
                              <div>
                                <strong>Setup Commands:</strong>
                                <div className="mt-1 bg-black/30 rounded p-2 font-mono text-xs max-h-32 overflow-y-auto">
                                  {analysis.build_and_test.setup_commands.map(
                                    (cmd, index) => (
                                      <div
                                        key={index}
                                        className="text-green-300 py-0.5"
                                      >
                                        {cmd}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {analysis.build_and_test.test_commands.length >
                              0 && (
                              <div>
                                <strong>Test Commands:</strong>
                                <div className="mt-1 bg-black/30 rounded p-2 font-mono text-xs max-h-32 overflow-y-auto">
                                  {analysis.build_and_test.test_commands.map(
                                    (cmd, index) => (
                                      <div
                                        key={index}
                                        className="text-blue-300 py-0.5"
                                      >
                                        {cmd}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {analysis.build_and_test.development_server && (
                              <div>
                                <strong>Dev Server:</strong>
                                <div className="mt-1 bg-black/30 rounded p-2 font-mono text-xs">
                                  <div className="text-yellow-300">
                                    {analysis.build_and_test.development_server}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Analysis & Implementation */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-purple-300">
                            Implementation Guide
                          </h3>
                          <div className="space-y-3">
                            {analysis.analysis.implementation_steps.length >
                              0 && (
                              <div>
                                <strong>Implementation Steps:</strong>
                                <ol className="mt-1 space-y-2 text-gray-300">
                                  {analysis.analysis.implementation_steps.map(
                                    (step, index) => (
                                      <li
                                        key={index}
                                        className="text-sm leading-relaxed"
                                      >
                                        {step}
                                      </li>
                                    )
                                  )}
                                </ol>
                              </div>
                            )}
                            {analysis.analysis.affected_components.length >
                              0 && (
                              <div>
                                <strong>Affected Components:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {analysis.analysis.affected_components.map(
                                    (component, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-orange-600/30 rounded text-xs"
                                      >
                                        {component}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {analysis.analysis.tests_needed.length > 0 && (
                              <div>
                                <strong>Tests Needed:</strong>
                                <ul className="mt-1 space-y-1 text-gray-300">
                                  {analysis.analysis.tests_needed.map(
                                    (test, index) => (
                                      <li
                                        key={index}
                                        className="text-sm leading-relaxed"
                                      >
                                        • {test}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                            {analysis.analysis.potential_risks &&
                              analysis.analysis.potential_risks.length > 0 && (
                                <div>
                                  <strong>Potential Risks:</strong>
                                  <ul className="mt-1 space-y-1 text-red-300">
                                    {analysis.analysis.potential_risks.map(
                                      (risk, index) => (
                                        <li
                                          key={index}
                                          className="text-sm leading-relaxed"
                                        >
                                          ⚠️ {risk}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-300">
                        Loading analysis...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-white">
                    {flattenedFiles.length > 0 ? (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">
                          Relevant Files ({flattenedFiles.length})
                        </h3>
                        <div className="space-y-3">
                          {flattenedFiles.map((file, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg cursor-pointer border-l-4 border-purple-500 transition-colors ${
                                selectedFile === file
                                  ? "bg-white/10"
                                  : "bg-transparent hover:bg-white/5"
                              }`}
                              onClick={() => setPickedFile(file)}
                            >
                              <div className="font-mono text-sm mb-2 break-all">
                                {file.pathName}
                              </div>
                              <div className="text-xs opacity-80 leading-relaxed">
                                {file.reason}
                              </div>
                              {file.keySections &&
                                file.keySections.length > 0 && (
                                  <div className="text-xs opacity-60 mt-2">
                                    {file.keySections.length} key section(s)
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-300">
                        Loading files...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex flex-col gap-4">
            {/* File Name Header */}
            <div className="glass-panel rounded-2xl p-4 text-center">
              <h2 className="text-white text-2xl font-mono break-all truncate md:break-words text-left overflow-hidden">
                {selectedFile?.pathName || "Select a file"}
              </h2>
            </div>

            {/* Code Editor */}
            <div className="flex-1 rounded-2xl overflow-hidden bg-[#18181B] min-h-0">
              <Editor
                language={getMonacoLanguageFromPath(
                  selectedFile?.pathName || ""
                )}
                value={
                  selectedFile?.keySections &&
                  selectedFile.keySections.length > 0
                    ? selectedFile.keySections
                        .map(
                          (section) =>
                            `// Lines ${section.line_start}-${section.line_end}: ${section.explanation}\n${section.code}`
                        )
                        .join("\n\n")
                    : `// Code content not available for this file`
                }
                theme="vs-dark"
                options={{
                  lineNumbers: "on",
                  minimap: { enabled: false },
                  readOnly: true,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-logo-feature {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-search-issues {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          position: relative;
        }
      `}</style>
    </div>
  );
}

function getMonacoLanguageFromPath(filePath: string): string {
  const extension = filePath.split(".").pop()?.toLowerCase();

  const extensionToLanguageMap = new Map<string, string>([
    ["js", "javascript"],
    ["mjs", "javascript"],
    ["cjs", "javascript"],
    ["ts", "typescript"],
    ["jsx", "javascript"],
    ["tsx", "typescript"],
    ["json", "json"],
    ["html", "html"],
    ["htm", "html"],
    ["css", "css"],
    ["scss", "scss"],
    ["less", "less"],
    ["md", "markdown"],
    ["markdown", "markdown"],
    ["xml", "xml"],
    ["yml", "yaml"],
    ["yaml", "yaml"],
    ["py", "python"],
    ["java", "java"],
    ["c", "c"],
    ["cpp", "cpp"],
    ["cc", "cpp"],
    ["cxx", "cpp"],
    ["c++", "cpp"],
    ["cs", "csharp"],
    ["go", "go"],
    ["rs", "rust"],
    ["php", "php"],
    ["rb", "ruby"],
    ["sh", "shell"],
    ["bash", "shell"],
    ["sql", "sql"],
    ["lua", "lua"],
    ["dart", "dart"],
    ["swift", "swift"],
    ["kt", "kotlin"],
    ["kts", "kotlin"],
  ]);

  return extensionToLanguageMap.get(extension || "") || "plaintext";
}
