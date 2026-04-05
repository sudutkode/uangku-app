import {debounce} from "@/utils";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useFetch} from "./axios/use-fetch";

interface IconItem {
  id: number;
  name: string;
  label: string;
}

export const useIconSearch = (selectedIconName?: string) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [allIcons, setAllIcons] = useState<IconItem[]>([]);
  const LIMIT = 60;

  const updateQuery = useMemo(
    () =>
      debounce((text: string) => {
        setDebouncedQuery(text);
        setOffset(0);
      }, 500),
    [],
  );

  const onSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      updateQuery(text);
    },
    [updateQuery],
  );

  // Fetching dengan query param 'selected'
  const {data, loading} = useFetch<{items: IconItem[]; total: number}>(
    `/transaction-categories/icons?search=${debouncedQuery}&limit=${LIMIT}&offset=${offset}${
      selectedIconName ? `&selected=${selectedIconName}` : ""
    }`,
    {},
    false,
  );

  useEffect(() => {
    if (data?.items) {
      if (offset === 0) {
        setAllIcons(data.items);
      } else {
        // Gabungkan data dan filter ID unik agar tidak ada duplikat ikon terpilih
        setAllIcons((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const newUniqueItems = data.items.filter(
            (i) => !existingIds.has(i.id),
          );
          return [...prev, ...newUniqueItems];
        });
      }
    }
  }, [data, offset]);

  const loadMore = useCallback(() => {
    const currentTotal = data?.total || 0;
    if (
      !loading &&
      allIcons.length < currentTotal &&
      allIcons.length >= LIMIT
    ) {
      setOffset((prev) => prev + LIMIT);
    }
  }, [loading, allIcons.length, data?.total]);

  return {
    icons: allIcons,
    loading,
    searchQuery,
    onSearchChange,
    loadMore,
  };
};
