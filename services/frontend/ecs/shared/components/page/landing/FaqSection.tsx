
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/shared/components/ui/Accordion";
import { cn } from "@/shared/lib/utils";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

const faq = [
  {
    question: "What is the EARIST Extension Service?",
    answer:
      "The EARIST Extension Service focuses on community empowerment through educational programs, skills development, and collaborative outreach projects to foster sustainable growth and positive social change.",
  },
  {
    question: "Who can participate in EARIST Extension Service programs?",
    answer:
      "Our programs are open to all, including students, professionals, local residents, and marginalized communities. We aim to provide accessible opportunities for everyone.",
  },
  {
    question: "How can I get involved with EARIST Extension Service?",
    answer:
      "You can get involved by attending workshops, volunteering in projects, or partnering with us for community-based initiatives. Visit our website for more details on current opportunities.",
  },
  {
    question: "Are the programs free of charge?",
    answer:
      "Many of our programs are offered free of charge, especially those aimed at underserved communities. Some specialized workshops may have a minimal fee to cover materials or resources.",
  },
  {
    question: "What types of workshops and training do you offer?",
    answer:
      "We offer a variety of workshops, including skills development, leadership training, entrepreneurship, digital literacy, health and wellness, and community-building initiatives.",
  },
  {
    question: "How do you ensure your programs are sustainable?",
    answer:
      "We focus on long-term development by providing continuous support, building local capacity, and ensuring that every program can have a lasting positive impact on the community.",
  },
  {
    question: "Can businesses or organizations collaborate with EARIST Extension Service?",
    answer:
      "Yes! We actively seek partnerships with businesses, non-profits, and other organizations to collaborate on projects that benefit the community. Contact us for partnership opportunities.",
  },
  {
    question: "How do you measure the impact of your programs?",
    answer:
      "We assess the success of our programs through feedback surveys, tracking community participation, and monitoring long-term outcomes such as skill acquisition, job placement, and social change.",
  },
  {
    question: "Is there a way to donate or support EARIST Extension Service?",
    answer:
      "Yes! We welcome donations and support from individuals, businesses, and organizations. Your contributions help us expand our outreach and provide more opportunities to those in need.",
  },
  {
    question: "How can I stay updated on upcoming programs and events?",
    answer:
      "Stay connected with us by subscribing to our newsletter, following our social media pages, or checking our website for the latest updates on programs and events.",
  },
];

export default function FAQSection  () {
  const [value, setValue] = useState<string>();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-(--breakpoint-lg)">
        <h2 className="text-4xl md:text-5xl leading-[1.15]! font-semibold tracking-[-0.035em]">
          Frequently Asked Questions
        </h2>

        <div className="mt-6 w-full grid md:grid-cols-2 gap-x-10">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={value}
            onValueChange={setValue}
          >
            {faq.slice(0, 5).map(({ question, answer }, index) => (
              <AccordionItem key={question} value={`question-${index}`}>
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger
                    className={cn(
                      "flex flex-1 items-center justify-between py-4 font-semibold transition-all hover:underline [&[data-state=open]>svg]:rotate-45",
                      "text-start text-lg"
                    )}
                  >
                    {question}
                    <PlusIcon className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionContent className="text-base text-muted-foreground text-pretty">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={value}
            onValueChange={setValue}
          >
            {faq.slice(5).map(({ question, answer }, index) => (
              <AccordionItem key={question} value={`question-${index + 5}`}>
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger
                    className={cn(
                      "flex flex-1 items-center justify-between py-4 font-semibold tracking-tight transition-all hover:underline [&[data-state=open]>svg]:rotate-45",
                      "text-start text-lg"
                    )}
                  >
                    {question}
                    <PlusIcon className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionContent className="text-base text-muted-foreground text-pretty">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};


