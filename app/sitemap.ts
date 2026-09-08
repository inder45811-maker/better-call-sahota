import {site,pillars} from '@/lib/site';
import services from '@/lib/services.json';
import {articles,stories} from '@/lib/editorial';
export default function sitemap(){if(site.preview)return [];return ['',...pillars.map(p=>p.slug),...services.map(s=>s.pillar+'/'+s.slug),'meet-sim','the-plan','book-review','contact','iht-calculator','insights','case-studies',...articles.map(a=>'insights/'+a.slug),...stories.map(s=>'case-studies/'+s.slug)].map(path=>({url:site.origin+'/'+path,lastModified:'2026-09-08'}));}
