'use client';

import site from '@/data/site.json';

const TECH_ICONS = {
  python: '/images/tech/python.svg',
  linux: '/images/tech/linux.svg',
  css: '/images/tech/css.svg',
  java: '/images/tech/java.svg',
  pygame: '/images/tech/python.svg',
  'c#': '/images/tech/csharp.svg',
  '.net': '/images/tech/dotnet.svg',
  javascript: '/images/tech/javascript.svg',
  html: '/images/tech/html.svg',
  flask: '/images/tech/flask.svg',
  django: '/images/tech/django.svg',
  opencv: '/images/tech/opencv.svg',
  'sql server': '/images/tech/sqlserver.svg',
  'sql developer': '/images/tech/sqldeveloper.svg',
  'azure devops': '/images/tech/azuredevops.svg',
  git: '/images/tech/git.svg',
  docker: '/images/tech/docker.svg',
};

export default function AboutWindow() {
  return (
    <div className="about-intro">
      <p>{site.intro}</p>
      <p>{site.longIntro}</p>
      <div className="tech-grid">
        {site.techStack.map((tech) => (
          <span key={tech} className="tech-chip">
            {TECH_ICONS[tech.toLowerCase()] && (
              <img src={TECH_ICONS[tech.toLowerCase()]} alt="" />
            )}
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
