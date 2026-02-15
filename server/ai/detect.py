import json
import sys
from collections import Counter

from ultralytics import YOLO


PRICE_MAP = {
    "shirt": 15,
    "pant": 20,
    "saree": 50,
    "uniform": 15,
    "other": 12,
}


def normalize_label(label: str) -> str:
    lower = label.lower()
    if any(token in lower for token in ["shirt", "jersey", "top"]):
        return "shirt"
    if any(token in lower for token in ["pant", "trouser", "jean"]):
        return "pant"
    if "saree" in lower:
        return "saree"
    if any(token in lower for token in ["uniform", "coat", "blazer"]):
        return "uniform"
    return "other"


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "image path is required"}))
        sys.exit(1)

    image_path = sys.argv[1]
    model = YOLO("yolov8n.pt")

    results = model(image_path, verbose=False)
    raw_items = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            label = model.names[class_id]
            raw_items.append(label)

    normalized = [normalize_label(label) for label in raw_items]
    counts = Counter(normalized)

    items = []
    total_count = 0
    total_price = 0
    for item_type, count in counts.items():
        price_per_piece = PRICE_MAP.get(item_type, 12)
        items.append(
            {
                "type": item_type,
                "count": count,
                "price_per_piece": price_per_piece,
            }
        )
        total_count += count
        total_price += count * price_per_piece

    if total_count == 0:
        # Fallback to one estimated mixed item when nothing is confidently detected.
        items = [{"type": "other", "count": 1, "price_per_piece": 12}]
        total_count = 1
        total_price = 12

    eco_score = max(55, min(98, 100 - total_count * 2))
    output = {
        "fabric": "Mixed garments",
        "count": total_count,
        "price": total_price,
        "eco_score": f"{eco_score}%",
        "items": items,
        "raw_items": raw_items,
    }

    print(json.dumps(output))


if __name__ == "__main__":
    main()
