
function BookCard(props) {
  return (
    <div className="book-card">

      <div className="book-cover">
        <img
          src={props.image}
          alt={props.title}
        />
      </div>

      <span className="book-category">
        {props.category}
      </span>

      <h3>{props.title}</h3>

      <p>{props.author}</p>

      <h4>₹{props.price}</h4>

      <button className="view-btn">
        View Details
      </button>

    </div>
  );
}

export default BookCard;
