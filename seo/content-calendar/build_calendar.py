#!/usr/bin/env python3
"""Merge topic inventories into a daily content calendar.

Usage: python3 build_calendar.py [--start 2026-09-05] [--end 2027-05-01]

Reads seo/content-calendar/topics-*.json, validates/dedupes, assigns one post per
day using each topic's publish window + priority + a monthly pillar mix, and
writes calendar.json + CONTENT-CALENDAR.md next to this script.
"""
import argparse, glob, json, os, re, sys
from collections import Counter, defaultdict
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
CAL_DIR = os.path.join(REPO, "calendars")  # repo convention: calendars/CONTENT-CALENDAR.md + calendars/YYYY-MM-briefs/DD-<slug>.md
SEO_CATEGORY = {
    "bluebonnets": "Ennis Bluebonnets",
    "ennis-dfw": "Ennis & DFW Things to Do",
    "date-ideas": "Dallas Date Ideas",
    "slingshot-101": "Polaris Slingshot 101",
    "news": "Ennis Slingshot News",
}
# Target share of posts per pillar by month (YYYY-MM). Remaining share falls to evergreen fill.
MONTH_MIX = {
    "2026-09": {"slingshot-101": .40, "ennis-dfw": .22, "date-ideas": .18, "bluebonnets": .12, "news": .08},
    "2026-10": {"slingshot-101": .30, "ennis-dfw": .28, "date-ideas": .20, "bluebonnets": .14, "news": .08},
    "2026-11": {"date-ideas": .32, "slingshot-101": .22, "ennis-dfw": .18, "bluebonnets": .18, "news": .10},
    "2026-12": {"date-ideas": .28, "bluebonnets": .24, "slingshot-101": .20, "ennis-dfw": .18, "news": .10},
    "2027-01": {"bluebonnets": .38, "ennis-dfw": .22, "date-ideas": .18, "slingshot-101": .12, "news": .10},
    "2027-02": {"bluebonnets": .40, "date-ideas": .20, "ennis-dfw": .20, "slingshot-101": .10, "news": .10},
    "2027-03": {"bluebonnets": .48, "ennis-dfw": .20, "date-ideas": .12, "slingshot-101": .08, "news": .12},
    "2027-04": {"bluebonnets": .50, "ennis-dfw": .18, "date-ideas": .10, "slingshot-101": .06, "news": .16},
    "2027-05": {"news": .5, "bluebonnets": .5},
}

def d(s):
    y, m, dd = map(int, s.split("-"))
    return date(y, m, dd)

def load_topics():
    topics = []
    for f in sorted(glob.glob(os.path.join(HERE, "topics-*.json"))):
        data = json.load(open(f))
        pillar = data["pillar"]
        for t in data["topics"]:
            t["pillar"] = pillar
            t["category_slug"] = data.get("category_slug", pillar)
            t["seo_category"] = SEO_CATEGORY.get(pillar, pillar)
            topics.append(t)
    return topics

def validate(topics):
    errs = []
    slugs, kws = Counter(), Counter()
    for t in topics:
        for k in ("id", "title", "slug", "primary_keyword", "template", "word_count", "publish_window"):
            if k not in t:
                errs.append(f"{t.get('id','?')} missing {k}")
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", t.get("slug", "")):
            errs.append(f"{t['id']} bad slug {t.get('slug')}")
        slugs[t["slug"]] += 1
        kws[t["primary_keyword"].strip().lower()] += 1
        pw = t["publish_window"]
        if not (d(pw["earliest"]) <= d(pw["ideal"]) <= d(pw["latest"])):
            errs.append(f"{t['id']} window inconsistent {pw}")
    for s, n in slugs.items():
        if n > 1: errs.append(f"duplicate slug {s} x{n}")
    for k, n in kws.items():
        if n > 1: errs.append(f"duplicate primary keyword '{k}' x{n}")
    return errs

def schedule(topics, start, end):
    days = [start + timedelta(i) for i in range((end - start).days + 1)]
    cal = {}
    unscheduled = list(topics)
    # 1) pin topics whose window is a single day or is flagged pinned
    for t in sorted(unscheduled, key=lambda x: x["publish_window"]["ideal"]):
        pw = t["publish_window"]
        if pw["earliest"] == pw["latest"] or t.get("pinned"):
            day = d(pw["ideal"])
            if day in cal:  # slide forward within window
                nd = day
                while nd in cal and nd <= d(pw["latest"]): nd += timedelta(1)
                day = nd
            if start <= day <= end and day not in cal:
                cal[day] = t
    unscheduled = [t for t in unscheduled if t not in cal.values()]
    # 2) fill day by day: candidates in window, score by pillar deficit vs monthly mix, priority, distance from ideal
    month_counts = defaultdict(Counter)
    for day, t in cal.items(): month_counts[day.strftime("%Y-%m")][t["pillar"]] += 1
    month_days = Counter(day.strftime("%Y-%m") for day in days)
    for day in days:
        if day in cal: continue
        mk = day.strftime("%Y-%m")
        mix = MONTH_MIX.get(mk, {})
        cands = [t for t in unscheduled if d(t["publish_window"]["earliest"]) <= day <= d(t["publish_window"]["latest"])]
        if not cands:
            cands = [t for t in unscheduled if d(t["publish_window"]["earliest"]) <= day]  # overdue
        if not cands: continue
        def score(t):
            target = mix.get(t["pillar"], .05) * month_days[mk]
            deficit = target - month_counts[mk][t["pillar"]]
            dist = abs((d(t["publish_window"]["ideal"]) - day).days)
            urgency = (d(t["publish_window"]["latest"]) - day).days
            return (-deficit * 3) + (t.get("priority", 2) * 2) + dist * 0.15 + (urgency * 0.05)
        best = min(cands, key=score)
        cal[day] = best; unscheduled.remove(best); month_counts[mk][best["pillar"]] += 1
    return cal, unscheduled

def write(cal, unscheduled, start, end):
    days = sorted(cal)
    out = [{"date": day.isoformat(), **{k: v for k, v in cal[day].items()}} for day in days]
    os.makedirs(CAL_DIR, exist_ok=True)
    for p in out:
        p["brief_path"] = f"calendars/{p['date'][:7]}-briefs/{p['date'][8:10]}-{p['slug']}.md"
    json.dump({"start": start.isoformat(), "end": end.isoformat(), "posts": out,
               "unscheduled": [t["id"] for t in unscheduled]}, open(os.path.join(HERE, "calendar.json"), "w"), indent=2)
    lines = [f"# Content Calendar — Ennis Slingshot Experience ({start} → {end})", "",
             f"_{len(out)} daily posts. One post per day, authored and scheduled in WordPress (blog.nxtmt.ventures, blog_id 249186184) with categories `EnnisSlingshot.com` (ID 34, routing) + the SEO category shown; the sync plugin commits the markdown into `client/content/blog/`. Briefs: `calendars/YYYY-MM-briefs/DD-<slug>.md`. Generated by `seo/content-calendar/build_calendar.py` from `seo/content-calendar/topics-*.json`._", ""]
    by_month = defaultdict(list)
    for p in out: by_month[p["date"][:7]].append(p)
    for mk in sorted(by_month):
        ps = by_month[mk]
        mix = Counter(p["pillar"] for p in ps)
        lines += [f"## {mk} — {len(ps)} posts  ({', '.join(f'{k} {v}' for k, v in mix.most_common())})", "",
                  "| Date | Day | Title | Pillar / SEO category | Template | Primary keyword | Words | Brief |", "|---|---|---|---|---|---|---|---|"]
        for p in ps:
            dt = d(p["date"])
            flags = "".join(x for x in [" 📍" if p.get("requires_onsite") else "", " ⚠️cond" if p.get("conditional") else "", " ⚡react" if p.get("reactive") else ""])
            lines.append(f"| {p['date']} | {dt.strftime('%a')} | {p['title']}{flags} | {p['seo_category']} | {p['template']} | {p['primary_keyword']} | {p['word_count']} | `{p['brief_path']}` |")
        lines.append("")
    if unscheduled:
        lines += ["## Unscheduled (bench)", ""] + [f"- {t['id']} — {t['title']}" for t in unscheduled] + [""]
    open(os.path.join(CAL_DIR, "CONTENT-CALENDAR.md"), "w").write("\n".join(lines))

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--start", default="2026-09-05"); ap.add_argument("--end", default="2027-05-01")
    a = ap.parse_args(); start, end = d(a.start), d(a.end)
    topics = load_topics()
    errs = validate(topics)
    if errs:
        print("VALIDATION ERRORS:"); print("\n".join(errs)); sys.exit(1)
    cal, un = schedule(topics, start, end)
    write(cal, un, start, end)
    days_total = (end - start).days + 1
    print(f"topics={len(topics)} scheduled={len(cal)}/{days_total} days unscheduled={len(un)}")
    print("pillar totals:", Counter(t["pillar"] for t in cal.values()))
