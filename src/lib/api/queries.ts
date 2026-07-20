// Shim - logic moved to src/lib/actions/* mirip next-strapi-main/src/lib/actions/*
// Keep re-exports so old imports still work.
export { getArticles } from '../actions/getArticles';
export { getArticleBySlug, getArticleByDocumentId } from '../actions/getArticle';
export { getLatestArticles } from '../actions/getLatestArticles';
export { getCategories } from '../actions/getCategories';
export { getGlobal } from '../actions/getGlobal';
export { getHomePage } from '../actions/getHomePage';
export { getPageBySlug } from '../actions/getPage';
export { getMenuItems, getTopbarMenu } from '../actions/getMenuItems';
export { getContactPage } from '../actions/getContactPage';
