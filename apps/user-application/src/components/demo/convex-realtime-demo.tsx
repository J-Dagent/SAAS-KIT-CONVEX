import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  convexQuery,
  useConvexMutation,
} from "@convex-dev/react-query";
import { api } from "@repo/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ConvexRealtimeDemo() {
  const [text, setText] = useState("");
  const notes = useQuery(convexQuery(api.demo.listNotes, {}));
  const addNote = useMutation({
    mutationFn: useConvexMutation(api.demo.addNote),
    onSuccess: () => setText(""),
  });
  const noteList = notes.data ?? [];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Notes partagées en temps réel</CardTitle>
        <CardDescription>
          Ouvrez cette page dans deux onglets. Une note ajoutée dans l’un
          apparaît dans l’autre sans rechargement ni polling.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim()) addNote.mutate({ text });
          }}
        >
          <Input
            aria-label="Nouvelle note partagée"
            maxLength={160}
            onChange={(event) => setText(event.target.value)}
            placeholder="Écrivez une courte note…"
            value={text}
          />
          <Button disabled={addNote.isPending || !text.trim()} type="submit">
            Ajouter
          </Button>
        </form>

        {notes.isPending ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : noteList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune note pour le moment.
          </p>
        ) : (
          <ul className="space-y-2">
            {noteList.map((note) => (
              <li className="rounded-md border p-3" key={note._id}>
                <p>{note.text}</p>
                {note.authorName ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.authorName}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
