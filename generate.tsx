#!/usr/bin/env -S deno run --allow-read --allow-write
import React from "https://esm.sh/react@18.2.0";
import { renderToString } from "https://esm.sh/react-dom@18.2.0/server";
import { parse } from "https://deno.land/std@0.163.0/encoding/yaml.ts";

interface CategoryInfo {
  name: string;
  wallpapers: Wallpaper[];
}

interface Wallpaper {
  author_name: string;
  author_url: string;
  source_url: string;
  image_url?: string;
}

const Table = (
  category: CategoryInfo,
  directory: string
): React.ReactElement => {
  return (
    <>
      <h3>{category.name}</h3>
      <table>
        <thead>
          <tr>
            <th>Author</th>
          </tr>
        </thead>
        <tbody>
          {category.wallpapers.map((info) => {
            let imgUrl = info.image_url;
            if (!imgUrl.startsWith("http")) {
              imgUrl = `https://raw.githubusercontent.com/catppuccin/wallpapers/main/${directory}/${info.image_url}`;
            }

            return (
              <>
                <tr>
                  <td>
                    <a href={info.author_url}>{info.author_name}</a>
                    {info.source_url && (
                      <>
                        {" "}
                        <a href={info.source_url}>(Source)</a>
                      </>
                    )}
                  </td>
                </tr>
                {info.image_url && (
                  <tr>
                    <td>
                      <a href={imgUrl}>
                        <img src={info.image_url} />
                      </a>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

for await (const dirEntry of Deno.readDir(".")) {
  if (dirEntry.isDirectory) {
    let content = "";

    try {
      content = await Deno.readTextFile(`./${dirEntry.name}/.authors.yml`);
    } catch (_) {
      console.warn(`No README.md found in ${dirEntry.name}`);
      continue;
    }

    const data = parse(content) as CategoryInfo;
    const mdTable = renderToString(Table(data, dirEntry.name));
    await Deno.writeTextFile(`${dirEntry.name}/README.md`, mdTable);
    console.log(`Generated README.md for ${dirEntry.name}`);
  }
}
