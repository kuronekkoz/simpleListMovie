import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher, tmdbAPI } from "../config";
import MovieCard from "../components/movie/MovieCard";
import { useDebounce } from "@uidotdev/usehooks";
import ReactPaginate from "react-paginate";

const itemsPerPage = 20;
const MoviePage = () => {
  const [itemOffset, setItemOffset] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [filter, setFilter] = useState("");
  const [nextPage, setNextPage] = useState(1);
  const [url, setUrl] = useState(tmdbAPI.getMovieList("popular", nextPage));
  const filterDebounce = useDebounce(filter, 500);
  const handlerFilterChange = (e) => {
    setFilter(e.target.value);
  };
  useEffect(() => {
    if (filterDebounce)
      setUrl(tmdbAPI.getMovieSearch(filterDebounce, nextPage));
    else setUrl(tmdbAPI.getMovieList("popular", nextPage));
  }, [filterDebounce, nextPage]);
  const { data, error } = useSWR(url, fetcher);
  const loading = !data && !error;
  const movies = data?.results || [];
  useEffect(() => {
    if (!data || !data.total_results) return;

    const endOfset = itemOffset + itemsPerPage;
    setPageCount(Math.ceil(data.total_results / itemsPerPage));
  }, [data, itemOffset]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % data.total_results;
    setItemOffset(newOffset);
    setNextPage(event.selected + 1);
    console.log(event.selected);
  };
  return (
    <div className="py-10 page-container">
      <div className="flex mb-10">
        <div className="flex-1">
          <input
            type="text"
            className="w-full p-4 outline-none bg-slate-800 text-white"
            placeholder="Type here to search ..."
            onChange={handlerFilterChange}
          />
        </div>

        <button className="p-4 bg-primary text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </div>
      {loading && (
        <div
          className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent 
         border-t-4 mx-auto animate-spin"
        ></div>
      )}
      <div className="grid grid-cols-4 gap-10">
        {!loading &&
          movies.length > 0 &&
          movies.map((item) => (
            <MovieCard key={item.id} item={item}></MovieCard>
          ))}
      </div>
      <div className="mt-10">
        <ReactPaginate
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          className="pagination"
        />
      </div>
    </div>
  );
};

export default MoviePage;
