'use client';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Accordion className="faq-list">
      {items.map((item, i) => (
        <AccordionItem key={item.q} value={i}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent keepMounted>
            <p>{item.a}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
