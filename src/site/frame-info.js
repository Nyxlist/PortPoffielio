// The small part of the site the page frame needs (theme, name, footer, menu).
// Passed to every page render instead of the whole site, which also holds every page's
// content and uploaded pictures; walking all that on each change made editing laggy.
export function frameInfo(site) {
  return {
    name: site.name,
    footerNote: site.footerNote,
    theme: site.theme,
    pages: site.pages.map(({ id, title, slug, inNav }) => ({
      id,
      title,
      slug,
      inNav,
    })),
  };
}
