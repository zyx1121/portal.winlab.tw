"use client";

import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { PORTALS } from "@/portals";
import { SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
      {PORTALS.map((portal) => (
        <Link href={portal.href} key={portal.name} target="_blank">
          <Item
            key={portal.name}
            variant="outline"
            className="cursor-pointer bg-background/50 backdrop-blur-lg hover:bg-background/70 hover:scale-101 transition-all duration-200"
          >
            <ItemMedia>
              <Image
                src={portal.icon}
                alt={portal.name}
                width={48}
                height={48}
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="font-bold">{portal.name}</ItemTitle>
              <ItemDescription className="flex flex-wrap gap-1">
                {portal.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full">
                    {tag}
                  </Badge>
                ))}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <SquareArrowOutUpRight className="size-4 mx-4" />
            </ItemActions>
          </Item>
        </Link>
      ))}
    </div>
  );
}
