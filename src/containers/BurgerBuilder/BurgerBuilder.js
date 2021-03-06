import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
// Components.
import Burger from "../../components/Burger/Burger";
import BuildControls from "../../components/Burger/BuildControls/BuildControls";
import Modal from "../../components/UI/Modal/Modal";
import OrderSummary from "../../components/Burger/OrderSummary/OrderSummary";
import Spinner from "../../components/UI/Spinner/Spinner";
import withErrorHandler from "../../hoc/withErrorHandler/withErrorHandler";
// Redux action types.
import * as actions from "../../store/actions/index";
// Axios instance.
import axios from "../../axios-orders";

class BurgerBuilder extends Component {
  // Constructor method.
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  componentDidMount() {
    this.props.onInitIngredient();
  }

  // Enable order button only when price is greater than 0.
  updateOrderState = () => {
    return this.props.totalPrice > 0;
  };

  showModalHandler = () => {
    if (this.props.isAuthenticated) {
      this.setState({
        showModal: true
      });
    } else {
      this.props.onSetAuthRedirectPath("/checkout");
      this.props.history.push("/auth");
    }
  };

  closeModalHandler = () => {
    this.setState({
      showModal: false
    });
  };

  cancelOrderHandler = () => {
    this.setState({
      showModal: false
    });
  };

  continueOrderHandler = () => {
    this.props.onInitPurchase();
    this.props.history.push("/checkout");
  };

  // Render the component.
  render() {
    // If the count of an ingredient is less than or equal to 0, disable the delete button.
    const disabledBtnInfo = {
      ...this.props.ingredients
    };
    for (let key in disabledBtnInfo) {
      disabledBtnInfo[key] = disabledBtnInfo[key] <= 0;
    }

    let orderSummary = null;

    let burger = this.props.error ? (
      <p>Ingredients can't be loaded</p>
    ) : (
      <Spinner />
    );

    if (this.props.ingredients) {
      burger = (
        <Fragment>
          <Burger ingredients={this.props.ingredients} />
          <BuildControls
            addIngredient={this.props.onIngredientAdded}
            deleteIngredient={this.props.onIngredientRemoved}
            disabledBtnInfo={disabledBtnInfo}
            price={this.props.totalPrice}
            orderState={this.updateOrderState()}
            order={this.showModalHandler}
            isAuthenticated={this.props.isAuthenticated}
          />
        </Fragment>
      );

      orderSummary = (
        <OrderSummary
          cancelOrder={this.cancelOrderHandler}
          continueOrder={this.continueOrderHandler}
          ingredients={this.props.ingredients}
          price={this.props.totalPrice}
        ></OrderSummary>
      );
    }

    return (
      <Fragment>
        <Modal show={this.state.showModal} modalClosed={this.closeModalHandler}>
          {orderSummary}
        </Modal>
        {burger}
      </Fragment>
    );
  }
}

// Redux setup.
const mapStateToProps = state => {
  return {
    ingredients: state.burgerBuilder.ingredients,
    totalPrice: state.burgerBuilder.totalPrice,
    error: state.burgerBuilder.error,
    isAuthenticated: state.auth.token !== null
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onIngredientAdded: ingredientName =>
      dispatch(actions.addIngredient(ingredientName)),
    onIngredientRemoved: ingredientName =>
      dispatch(actions.removeIngredient(ingredientName)),
    onInitIngredient: () => dispatch(actions.initIngredients()),
    onInitPurchase: () => dispatch(actions.purchaseInit()),
    onSetAuthRedirectPath: path => dispatch(actions.setAuthRedirectPath(path))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withErrorHandler(BurgerBuilder, axios));
